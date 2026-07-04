import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string; lessonId: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, lessonId } = await params;

    const lesson = await safeQuery(() =>
      prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: { select: { id: true, title: true, slug: true } },
          exam: {
            include: {
              questions: { orderBy: { orderIndex: "asc" } },
              submissions: {
                where: { studentId: session.user.id },
                include: { answers: true },
                take: 1,
              },
            },
          },
        },
      }),
    );

    if (!lesson || lesson.course.slug !== slug) {
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

    const [progress, allLessons, lessonProgress] = await Promise.all([
      safeQuery(() =>
        prisma.lessonProgress.findUnique({
          where: { studentId_lessonId: { studentId: session.user.id, lessonId } },
        }),
      ),
      safeQuery(() =>
        prisma.lesson.findMany({
          where: { courseId: lesson.course.id, isPublished: true },
          orderBy: { order: "asc" },
          select: { id: true, title: true, order: true },
        }),
      ),
      safeQuery(() =>
        prisma.lessonProgress.findMany({
          where: {
            studentId: session.user.id,
            lesson: { courseId: lesson.course.id },
            completed: true,
          },
          select: { lessonId: true },
        }),
      ),
    ]);

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      order: lesson.order,
      duration: lesson.duration,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      audioUrl: lesson.audioUrl,
      exam: lesson.exam
        ? {
            id: lesson.exam.id,
            title: lesson.exam.title,
            durationMinutes: lesson.exam.durationMinutes,
            totalMarks: lesson.exam.totalMarks,
            passMark: lesson.exam.passMark,
            questions: lesson.exam.questions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options,
              marks: q.marks,
              orderIndex: q.orderIndex,
            })),
            submission: lesson.exam.submissions[0]
              ? {
                  id: lesson.exam.submissions[0].id,
                  status: lesson.exam.submissions[0].status,
                  totalScore: lesson.exam.submissions[0].totalScore,
                  answers: lesson.exam.submissions[0].answers.map((a) => ({
                    questionId: a.questionId,
                    answerText: a.answerText,
                    selectedOption: a.selectedOption,
                    isCorrect: a.isCorrect,
                    score: a.score,
                    aiFeedback: a.aiFeedback,
                  })),
                }
              : null,
          }
        : null,
      progress: {
        completed: progress?.completed ?? false,
        score: progress?.score ?? null,
      },
      allLessons: allLessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
      })),
      completedLessonIds: lessonProgress.map((lp) => lp.lessonId),
    });
  } catch (error) {
    console.error("Lesson detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
