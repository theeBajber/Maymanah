import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { CourseCategory } from "@prisma/client";

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
