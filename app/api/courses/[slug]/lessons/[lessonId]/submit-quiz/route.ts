import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string; lessonId: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, lessonId } = await params;
    const body = await req.json();
    const { answers } = body as {
      answers: Array<{ questionId: string; selectedOption: number; answerText?: string }>;
    };

    const lesson = await safeQuery(() =>
      prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: { select: { id: true, slug: true } },
          exam: {
            include: { questions: true },
          },
        },
      }),
    );

    if (!lesson || lesson.course.slug !== slug || !lesson.exam) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const enrollment = await safeQuery(() =>
      prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: lesson.course.id } },
        select: { status: true },
      }),
    );
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    const exam = lesson.exam;
    let totalScore = 0;

    const existingSubmission = await safeQuery(() =>
      prisma.submission.findUnique({
        where: { examId_studentId: { examId: exam.id, studentId: session.user.id } },
      }),
    );

    const submission = existingSubmission ?? (await safeQuery(() =>
      prisma.submission.create({
        data: {
          examId: exam.id,
          studentId: session.user.id,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      }),
    ));

    if (!submission) {
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    for (const answer of answers) {
      const question = exam.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let score = 0;

      if (question.questionType === "MCQ" && question.options) {
        const opts = question.options as Array<{ text: string; isCorrect: boolean }>;
        isCorrect = opts[answer.selectedOption]?.isCorrect ?? false;
        score = isCorrect ? question.marks : 0;
      }

      totalScore += score;

      await safeQuery(() =>
        prisma.answer.upsert({
          where: {
            submissionId_questionId: { submissionId: submission.id, questionId: question.id },
          },
          update: {
            selectedOption: answer.selectedOption,
            answerText: answer.answerText,
            isCorrect,
            score,
            answeredAt: new Date(),
          },
          create: {
            submissionId: submission.id,
            questionId: question.id,
            selectedOption: answer.selectedOption,
            answerText: answer.answerText,
            isCorrect,
            score,
          },
        }),
      );
    }

    await safeQuery(() =>
      prisma.submission.update({
        where: { id: submission.id },
        data: { totalScore, submittedAt: new Date() },
      }),
    );

    return NextResponse.json({
      submissionId: submission.id,
      totalScore,
      totalMarks: exam.totalMarks,
      passed: totalScore >= exam.passMark,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
