import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

export async function getLessonProgress(
  lessonId: string,
  studentId: string,
) {
  return safeQuery(() =>
    prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
    }),
  );
}

export async function completeLesson(
  lessonId: string,
  score?: number,
) {
  const session = await auth();
  if (!session?.user?.id) return;

  const progress = await safeQuery(() =>
    prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId,
        },
      },
      create: {
        studentId: session.user.id,
        lessonId,
        completed: true,
        score,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        score,
        completedAt: new Date(),
      },
    }),
  );

  // Update enrollment progress
  const lesson = await safeQuery(() =>
    prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        courseId: true,
        course: {
          select: {
            _count: { select: { lessons: { where: { isPublished: true } } } },
          },
        },
      },
    }),
  );

  if (lesson) {
    const completedCount = await safeQuery(() =>
      prisma.lessonProgress.count({
        where: {
          studentId: session.user.id,
          lesson: { courseId: lesson.courseId },
          completed: true,
        },
      }),
    );

    const total = lesson.course._count.lessons;
    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    await safeQuery(() =>
      prisma.enrollment.updateMany({
        where: {
          userId: session.user.id,
          courseId: lesson.courseId,
        },
        data: { progress: pct },
      }),
    );
  }

  return progress;
}
