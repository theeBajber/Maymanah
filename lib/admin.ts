import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import type { CourseCategory, UserRole } from "@prisma/client";
import { Prisma } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export function checkAdmin(role: string | undefined): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export async function requireAdmin() {
  const session = await auth();
  if (!session || !checkAdmin(session.user.role)) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function getAdminCourses() {
  await requireAdmin();
  return safeQuery(() =>
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
    }),
  );
}

export async function getAdminCourse(id: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
    }),
  );
}

export async function getAdminLessons(courseId: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { lessonProgress: true } },
      },
    }),
  );
}

export async function getAdminLesson(id: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.lesson.findUnique({
      where: { id },
      include: { course: { select: { id: true, title: true, slug: true } } },
    }),
  );
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

// ─── Teacher Approval ───

export async function getTeachers() {
  await requireAdmin();
  return safeQuery(() =>
    prisma.user.findMany({
      where: { role: "TEACHER" },
      include: {
        ustadhProfile: true,
        _count: {
          select: {
            teachings: true,
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  );
}

export async function getTeacherProfile(userId: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.user.findUnique({
      where: { id: userId, role: "TEACHER" },
      include: {
        ustadhProfile: true,
        profile: true,
        _count: {
          select: {
            teachings: true,
            appointments: true,
            studentNotes: true,
          },
        },
      },
    }),
  );
}

export async function approveTeacher(userId: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.ustadhProfile.update({
      where: { userId },
      data: { isApproved: true },
    }),
  );
}

export async function rejectTeacher(userId: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.ustadhProfile.update({
      where: { userId },
      data: { isApproved: false },
    }),
  );
}

export async function setTeacherReliabilityScore(userId: string, score: number) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.ustadhProfile.update({
      where: { userId },
      data: { reliabilityScore: score },
    }),
  );
}

// ─── User Management ───

export async function getUsers(params: {
  search?: string;
  role?: UserRole | "ALL";
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { search, role, page = 1, pageSize = 20 } = params;

  const where: Prisma.UserWhereInput = {};
  if (role && role !== "ALL") {
    where.role = role;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    safeQuery(() =>
      prisma.user.findMany({
        where,
        include: {
          profile: { select: { phone: true, country: true } },
          _count: { select: { enrollments: true, teachings: true, submissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ),
    safeQuery(() => prisma.user.count({ where })),
  ]);

  return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUserDetails(userId: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.user.findUnique({
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
        teachings: {
          include: { student: { select: { id: true, name: true, email: true } } },
          take: 20,
        },
        learnings: {
          include: { teacher: { select: { id: true, name: true, email: true } } },
          take: 20,
        },
        _count: {
          select: {
            enrollments: true,
            submissions: true,
            teachings: true,
            learnings: true,
            appointments: true,
            donations: true,
            lessonProgress: true,
          },
        },
      },
    }),
  );
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    }),
  );
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  return safeQuery(() =>
    prisma.user.delete({ where: { id: userId } }),
  );
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
  ] = await Promise.all([
    safeQuery(() => prisma.user.count()),
    safeQuery(() => prisma.user.count({ where: { role: "TEACHER" } })),
    safeQuery(() => prisma.user.count({ where: { role: "STUDENT" } })),
    safeQuery(() => prisma.user.count({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } })),
    safeQuery(() => prisma.course.count()),
    safeQuery(() => prisma.lesson.count()),
    safeQuery(() => prisma.enrollment.count()),
    safeQuery(() => prisma.mentorship.count({ where: { status: "ACTIVE" } })),
    safeQuery(() => prisma.mentorship.count({ where: { status: "COMPLETED" } })),
    safeQuery(() => prisma.donation.count({ where: { status: "COMPLETED" } })),
    safeQuery(() =>
      prisma.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    ),
    safeQuery(() =>
      prisma.ustadhProfile.count({ where: { isApproved: false } }),
    ),
    safeQuery(() => prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } })),
    safeQuery(() =>
      prisma.enrollment.count({ where: { enrolledAt: { gte: thirtyDaysAgo } } }),
    ),
  ]);

  // Monthly enrollment trend (last 12 months)
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const enrollmentTrend = await safeQuery(() =>
    prisma.enrollment.findMany({
      where: { enrolledAt: { gte: twelveMonthsAgo } },
      select: { enrolledAt: true },
      orderBy: { enrolledAt: "asc" },
    }),
  );

  // User sign-ups by month (last 12 months)
  const userTrend = await safeQuery(() =>
    prisma.user.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: "asc" },
    }),
  );

  // Course-level stats
  const courseStats = await safeQuery(() =>
    prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        _count: { select: { lessons: true, enrollments: true, exams: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  );

  // Exam pass rate stats
  const gradedSubmissions = await safeQuery(() =>
    prisma.submission.findMany({
      where: { status: "GRADED" },
      select: {
        id: true,
        totalScore: true,
        exam: { select: { passMark: true, title: true, courseId: true } },
      },
    }),
  );

  const passedExams = gradedSubmissions.filter(
    (s) => s.totalScore !== null && s.exam.passMark !== null && s.totalScore >= s.exam.passMark,
  ).length;

  // Recent audit log
  const recentAuditLog = await safeQuery(() =>
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  );

  // Build trend data
  const enrollmentTrendByMonth = aggregateByMonth(enrollmentTrend.map((e) => e.enrolledAt));
  const userSignupsByMonth = aggregateByMonthWithRole(userTrend);

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
      enrollmentTrendByMonth,
      userSignupsByMonth,
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

function aggregateByMonthWithRole(
  data: { createdAt: Date; role: string }[],
) {
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
