import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { gradeExam } from "@/lib/exams";
import { completeLesson } from "@/lib/progress";

type RouteContext = { params: Promise<{ submissionId: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { submissionId } = await params;

    const submission = await safeQuery(() =>
      prisma.submission.findUnique({ where: { id: submissionId } }),
    );
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (submission.studentId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (submission.status !== "IN_PROGRESS") return NextResponse.json({ error: "Already finalized" }, { status: 400 });

    await safeQuery(() =>
      prisma.submission.update({
        where: { id: submissionId },
        data: { status: "SUBMITTED", submittedAt: new Date() },
      }),
    );

    const graded = await gradeExam(submissionId);

    if (graded) {
      const exam = await safeQuery(() =>
        prisma.exam.findUnique({
          where: { id: submission.examId },
          select: { id: true, lessonId: true, examType: true, courseId: true, passMark: true, totalMarks: true },
        }),
      );

      if (exam?.lessonId) {
        await completeLesson(exam.lessonId, graded.totalScore ?? undefined);
      }

      if (exam?.examType === "FINAL" && graded.totalScore != null) {
        const { passFinalExam, canRetakeExam, resetCourseProgress } = await import("@/lib/exams");

        const pct = (exam.totalMarks ?? 1) > 0 ? (graded.totalScore / (exam.totalMarks ?? 1)) * 100 : 0;
        if (pct >= (exam.passMark ?? 50)) {
          await passFinalExam(submissionId);
        } else {
          const retakeAllowed = await canRetakeExam(exam.id, session.user.id);
          if (!retakeAllowed) {
            const result = await safeQuery(() =>
              prisma.submission.findUnique({
                where: { id: submissionId },
                include: {
                  exam: { select: { id: true, passMark: true, totalMarks: true, lessonId: true, examType: true } },
                  answers: { include: { question: true } },
                },
              }),
            );
            await resetCourseProgress(exam.courseId, session.user.id);
            return NextResponse.json(result);
          }
        }
      }
    }

    const updated = await safeQuery(() =>
      prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          exam: { select: { id: true, passMark: true, totalMarks: true, lessonId: true, examType: true } },
          answers: { include: { question: true } },
        },
      }),
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Finalize error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
