import "server-only";

import { db } from "./db";

/**
 * Records a fact about how the platform is used.
 *
 * Fire-and-forget by design: analytics must never fail the action being
 * measured, so a recording failure is logged and dropped rather than thrown.
 */
export async function logAnalytics({
  userId,
  metricType,
  metricValue,
  courseId,
  metadata,
}: {
  userId: string;
  metricType: string;
  metricValue?: number;
  courseId?: string;
  metadata?: Record<string, string | number | boolean>;
}): Promise<void> {
  try {
    await db.userAnalytics.create({
      data: { userId, metricType, metricValue, courseId, metadata: metadata ?? {} },
    });
  } catch (error) {
    console.error("Could not record analytics", error);
  }
}

/** A student's graded exam record, newest first. */
export async function getStudentExamPerformance(studentId: string) {
  return db.submission.findMany({
    where: { studentId, status: "GRADED" },
    include: { exam: { select: { title: true, totalMarks: true, passMark: true, courseId: true } } },
    orderBy: { submittedAt: "desc" },
  });
}

/** How far a student has read through each course with completed lessons. */
export async function getStudentCourseProgress(studentId: string) {
  return db.lessonProgress.findMany({
    where: { studentId, completed: true },
    include: { lesson: { select: { courseId: true, course: { select: { title: true, slug: true } } } } },
  });
}

/** Totals for one course: enrolments, lessons, and exams. */
export async function getCourseStats(courseId: string) {
  const [enrollments, lessons, exams] = await Promise.all([
    db.enrollment.count({ where: { courseId, status: "ACTIVE" } }),
    db.lesson.count({ where: { courseId, isPublished: true } }),
    db.exam.count({ where: { courseId, isPublished: true } }),
  ]);
  return { enrollments, lessons, exams };
}
