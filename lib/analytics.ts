import { prisma, safeQuery } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getStudentExamPerformance(studentId: string) {
  return safeQuery(() =>
    prisma.submission.findMany({
      where: { studentId, status: "GRADED" },
      include: {
        exam: {
          select: { title: true, totalMarks: true, passMark: true, courseId: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
  );
}

export async function getStudentCourseProgress(studentId: string) {
  return safeQuery(() =>
    prisma.lessonProgress.findMany({
      where: { studentId, completed: true },
      include: {
        lesson: {
          select: { title: true, courseId: true, course: { select: { title: true, slug: true } } },
        },
      },
      orderBy: { completedAt: "desc" },
    }),
  );
}

export async function logAnalytics(params: {
  userId: string;
  metricType: string;
  metricValue?: number;
  courseId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return safeQuery(() =>
    prisma.userAnalytics.create({
      data: {
        userId: params.userId,
        metricType: params.metricType,
        metricValue: params.metricValue,
        courseId: params.courseId,
        metadata: params.metadata ?? {},
      },
    }),
  );
}

export async function getCourseStats(courseId: string) {
  const [enrollments, lessons, exams] = await Promise.all([
    safeQuery(() => prisma.enrollment.count({ where: { courseId, status: "ACTIVE" } })),
    safeQuery(() => prisma.lesson.count({ where: { courseId, isPublished: true } })),
    safeQuery(() => prisma.exam.count({ where: { courseId, isPublished: true } })),
  ]);
  return { enrollments, lessons, exams };
}
