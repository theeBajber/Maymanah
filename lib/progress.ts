import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { issueCertificate } from "@/lib/certificate";

export async function getLessonProgress(lessonId: string, studentId: string) {
  return safeQuery(() =>
    prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
    }),
  );
}

export async function completeLesson(lessonId: string, score?: number) {
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

  await safeQuery(() =>
    prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 5 } },
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

    if (pct === 100) {
      const finalExam = await safeQuery(() =>
        prisma.exam.findFirst({
          where: {
            courseId: lesson.courseId,
            examType: "FINAL",
            isPublished: true,
          },
          select: { id: true, passMark: true, totalMarks: true },
        }),
      );

      if (finalExam) {
        const graded = await safeQuery(() =>
          prisma.submission.findFirst({
            where: {
              examId: finalExam.id,
              studentId: session.user.id,
              status: "GRADED",
            },
            orderBy: { attemptNumber: "desc" },
            select: { totalScore: true },
          }),
        );

        const pctPassed =
          graded && (finalExam.totalMarks ?? 1) > 0
            ? ((graded.totalScore ?? 0) / (finalExam.totalMarks ?? 1)) * 100 >=
              (finalExam.passMark ?? 50)
            : false;

        if (!pctPassed) {
          await safeQuery(() =>
            prisma.enrollment.updateMany({
              where: { userId: session.user.id, courseId: lesson.courseId },
              data: { progress: 99 },
            }),
          );
          return progress;
        }
      }
    }

    await safeQuery(() =>
      prisma.enrollment.updateMany({
        where: {
          userId: session.user.id,
          courseId: lesson.courseId,
        },
        data: {
          progress: pct,
          ...(pct === 100
            ? { status: "COMPLETED", completedAt: new Date() }
            : {}),
        },
      }),
    );

    if (pct === 100) {
      await safeQuery(() =>
        prisma.user.update({
          where: { id: session.user.id },
          data: { xp: { increment: 20 } },
        }),
      );
    }
  }

  return progress;
}

export async function updateHifdhProgress(studentId: string) {
  const course = await safeQuery(() =>
    prisma.course.findFirst({
      where: { slug: "hifdh-ul-quran" },
      select: { id: true },
    }),
  );
  if (!course) return;

  const result = await safeQuery(() =>
    prisma.sessionPlan.aggregate({
      _max: { toSurah: true },
      where: {
        appointment: {
          mentorship: { studentId },
        },
      },
    }),
  );

  const maxSurah = result._max.toSurah ?? 0;
  const pct = Math.round((maxSurah / 114) * 100);

  await safeQuery(() =>
    prisma.enrollment.updateMany({
      where: { userId: studentId, courseId: course.id },
      data: {
        progress: pct,
        ...(pct === 100
          ? { status: "COMPLETED", completedAt: new Date() }
          : {}),
      },
    }),
  );

  if (pct === 100) {
    const latestPlan = await safeQuery(() =>
      prisma.sessionPlan.findFirst({
        where: {
          appointment: { mentorship: { studentId } },
        },
        orderBy: { updatedAt: "desc" },
        include: {
          appointment: {
            include: {
              mentorship: {
                include: { teacher: { select: { name: true } } },
              },
            },
          },
        },
      }),
    );

    const teacherName =
      latestPlan?.appointment?.mentorship?.teacher?.name ?? undefined;

    await issueCertificate(studentId, course.id, teacherName);

    await safeQuery(() =>
      prisma.user.update({
        where: { id: studentId },
        data: { xp: { increment: 20 } },
      }),
    );
  }
}
