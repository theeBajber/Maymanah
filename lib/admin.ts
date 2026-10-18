import "server-only";

import type { CourseCategory, UserRole } from "@prisma/client";

import { auth } from "./auth";
import { recentAuditEvents, logAuditEvent } from "./audit";
import type { LessonPreview } from "./book-import";
import { db } from "./db";

/** Raised when a caller reaches an admin surface without the standing for it. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Whether a role is allowed to administer the platform. */
export function checkAdmin(role: string | undefined): boolean {
  return role === "ADMIN";
}

/**
 * Confirms the caller is a signed-in administrator.
 *
 * Returns the session so callers can record who made the change. Throws rather
 * than returning a falsy value, so a caller cannot accidentally proceed down
 * the success path after forgetting to check.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session || !checkAdmin(session.user.role)) {
    throw new UnauthorizedError();
  }
  return session;
}

// ─── Courses ───

export async function getAdminCourses() {
  await requireAdmin();
  return db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lessons: true, enrollments: true } } },
  });
}

export async function getAdminCourse(id: string) {
  await requireAdmin();
  return db.course.findUnique({
    where: { id },
    include: { _count: { select: { lessons: true, enrollments: true } } },
  });
}

export async function getAdminLessons(courseId: string) {
  await requireAdmin();
  return db.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: { _count: { select: { lessonProgress: true } } },
  });
}

export async function getAdminLesson(id: string) {
  await requireAdmin();
  return db.lesson.findUnique({
    where: { id },
    include: { course: { select: { id: true, title: true, slug: true } } },
  });
}

export type CreateCourseInput = {
  title: string;
  slug: string;
  description?: string;
  category: CourseCategory;
  image?: string;
  enrollmentKey?: string;
  isPublished?: boolean;
  isActive?: boolean;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

export type CreateLessonInput = {
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  order: number;
  duration?: number;
  isPublished?: boolean;
};

export type UpdateLessonInput = Partial<CreateLessonInput>;

// ─── Teacher approval ───

export async function getTeachers() {
  await requireAdmin();
  return db.user.findMany({
    where: { role: "TEACHER", ustadhProfile: { isNot: null } },
    include: {
      ustadhProfile: true,
      _count: { select: { studentMentorships: true, teacherAppointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeacherProfile(userId: string) {
  await requireAdmin();
  return db.user.findUnique({
    where: { id: userId, role: "TEACHER" },
    include: {
      ustadhProfile: true,
      profile: true,
      _count: {
        select: { studentMentorships: true, teacherAppointments: true },
      },
    },
  });
}

export async function approveTeacher(userId: string) {
  await requireAdmin();
  return db.ustadhProfile.update({ where: { userId }, data: { isApproved: true, rejectedAt: null } });
}

export async function rejectTeacher(userId: string) {
  await requireAdmin();
  return db.ustadhProfile.update({ where: { userId }, data: { isApproved: false, rejectedAt: new Date() } });
}

export async function setTeacherReliabilityScore(userId: string, score: number) {
  await requireAdmin();
  return db.ustadhProfile.update({ where: { userId }, data: { reliabilityScore: score } });
}

// ─── User management ───

export async function getUsers(params: {
  search?: string;
  role?: UserRole | "ALL";
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { search, role, page = 1, pageSize = 20 } = params;

  const where = {
    ...(role && role !== "ALL" ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        profile: { select: { phone: true, country: true } },
        _count: { select: { enrollments: true, teacherMentorships: true, submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUserDetails(userId: string) {
  await requireAdmin();
  return db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      ustadhProfile: true,
      enrollments: {
        include: { course: { select: { id: true, title: true, slug: true } } },
        orderBy: { enrolledAt: "desc" },
      },
      submissions: {
        include: { exam: { select: { id: true, title: true, courseId: true } } },
        orderBy: { submittedAt: "desc" },
        take: 20,
      },
      teacherMentorships: {
        include: { student: { select: { id: true, name: true, email: true } } },
        take: 20,
      },
      studentMentorships: {
        include: { teacher: { select: { id: true, name: true, email: true } } },
        take: 20,
      },
      _count: {
        select: {
          enrollments: true,
          submissions: true,
          teacherMentorships: true,
          studentMentorships: true,
          teacherAppointments: true,
          donations: true,
          lessonProgress: true,
        },
      },
    },
  });
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  await requireAdmin();
  return db.user.update({ where: { id: userId }, data: { role: newRole } });
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  return db.user.delete({ where: { id: userId } });
}

/**
 * Writes a confirmed book import into a course.
 *
 * Each lesson becomes a row, and any questions attached to it become a
 * published quiz on that lesson. Runs in one transaction: a half-imported book
 * would leave a course that looks complete but stops midway.
 */
export async function saveImportedLessons(
  courseId: string,
  lessons: LessonPreview[],
  adminId: string,
): Promise<{ id: string; title: string; order: number }[]> {
  await requireAdmin();

  const created = await db.$transaction(
    async (tx) => {
      const result: { id: string; title: string; order: number }[] = [];

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const duration = Math.max(10, Math.ceil(lesson.content.length / 1500));

        const row = await tx.lesson.create({
          data: { courseId, title: lesson.title, content: lesson.content, order: i, duration, isPublished: true },
        });
        result.push({ id: row.id, title: row.title, order: row.order });

        if (lesson.questions.length > 0) {
          const totalMarks = lesson.questions.reduce((sum, q) => sum + q.marks, 0);
          await tx.exam.create({
            data: {
              title: `${lesson.title} Quiz`,
              courseId,
              lessonId: row.id,
              durationMinutes: Math.max(5, Math.ceil(lesson.questions.length * 2)),
              passMark: 50,
              totalMarks,
              isPublished: true,
              questions: {
                create: lesson.questions.map((q, idx) => ({
                  questionText: q.questionText,
                  questionType: "MCQ",
                  marks: q.marks,
                  options: q.options,
                  orderIndex: idx,
                })),
              },
            },
          });
        }
      }

      return result;
    },
    { timeout: 120000 },
  );

  await logAuditEvent({
    action: "COURSE_IMPORTED",
    userId: adminId,
    metadata: { courseId, lessonCount: lessons.length, lessonTitles: lessons.map((l) => l.title) },
  });

  return created;
}

// ─── Certificates ───

export async function getAdminCertificates() {
  await requireAdmin();
  return db.ijazah.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  });
}

// ─── Analytics ───

export async function getAnalytics() {
  await requireAdmin();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalTeachers,
    totalStudents,
    totalAdmins,
    totalCourses,
    totalLessons,
    totalEnrollments,
    activeMentorships,
    completedMentorships,
    totalDonations,
    donationRevenue,
    pendingTeachers,
    newUsers30d,
    newEnrollments30d,
    enrollmentTrend,
    userTrend,
    courseStats,
    gradedSubmissions,
    recentAuditLog,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "TEACHER" } }),
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.course.count(),
    db.lesson.count(),
    db.enrollment.count(),
    db.mentorship.count({ where: { status: "ACTIVE" } }),
    db.mentorship.count({ where: { status: "COMPLETED" } }),
    db.donation.count({ where: { status: "COMPLETED" } }),
    db.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.ustadhProfile.count({ where: { isApproved: false, rejectedAt: null } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.enrollment.count({ where: { enrolledAt: { gte: thirtyDaysAgo } } }),
    db.enrollment.findMany({
      where: { enrolledAt: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } },
      select: { enrolledAt: true },
      orderBy: { enrolledAt: "asc" },
    }),
    db.user.findMany({
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: "asc" },
    }),
    db.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        _count: { select: { lessons: true, enrollments: true, exams: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.submission.findMany({
      where: { status: "GRADED" },
      select: {
        id: true,
        totalScore: true,
        exam: { select: { passMark: true, totalMarks: true, title: true, courseId: true } },
      },
    }),
    recentAuditEvents(20),
  ]);

  const passedExams = gradedSubmissions.filter((s) => {
    const totalMarks = s.exam.totalMarks ?? 1;
    const pct = totalMarks > 0 ? ((s.totalScore ?? -1) / totalMarks) * 100 : 0;
    return pct >= s.exam.passMark;
  }).length;

  return {
    overview: {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalAdmins,
      totalCourses,
      totalLessons,
      totalEnrollments,
      activeMentorships,
      completedMentorships,
      totalDonations,
      donationRevenue: donationRevenue._sum.amount ?? 0,
      pendingTeachers,
      newUsers30d,
      newEnrollments30d,
    },
    trends: {
      enrollmentTrendByMonth: aggregateByMonth(enrollmentTrend.map((e) => e.enrolledAt)),
      userSignupsByMonth: aggregateByMonthWithRole(userTrend),
    },
    courses: courseStats.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      lessons: c._count.lessons,
      enrollments: c._count.enrollments,
      exams: c._count.exams,
    })),
    exams: {
      total: gradedSubmissions.length,
      passed: passedExams,
      failed: gradedSubmissions.length - passedExams,
    },
    recentAuditLog,
  };
}

function aggregateByMonth(dates: Date[]) {
  const map = new Map<string, number>();
  for (const d of dates) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function aggregateByMonthWithRole(data: { createdAt: Date; role: string }[]) {
  const map = new Map<string, { total: number; students: number; teachers: number }>();
  for (const d of data) {
    const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = map.get(key) ?? { total: 0, students: 0, teachers: 0 };
    entry.total++;
    if (d.role === "STUDENT") entry.students++;
    if (d.role === "TEACHER") entry.teachers++;
    map.set(key, entry);
  }
  return Array.from(map.entries())
    .map(([month, counts]) => ({ month, ...counts }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
