import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { CourseCategory } from "@prisma/client";
import { autoPairHifdhStudent } from "@/lib/mentorship";

export type EnrolledCourse = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  category: string | null;
  progress: number | null;
  lessons: number;
  enrollmentStatus: string;
};

export type AvailableCourse = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  category: string | null;
  lessons: number;
};

export type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  category: CourseCategory;
  description: string | null;
  lessons: {
    id: string;
    title: string;
    order: number;
    duration: number | null;
  }[];
  enrollmentStatus: string | null;
  progress: number | null;
};

export type CoursesData = {
  enrolledCourses: EnrolledCourse[];
  availableCourses: AvailableCourse[];
};

async function getCurrentUserId() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  return safeQuery(() =>
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
  );
}

const courseDetailSelect = {
  id: true,
  title: true,
  slug: true,
  image: true,
  category: true,
  description: true,
  lessons: {
    select: {
      id: true,
      title: true,
      order: true,
      duration: true,
    },
    orderBy: { order: "asc" as const },
  },
};

export async function getCoursesData(): Promise<CoursesData | null> {
  const user = await getCurrentUserId();
  if (!user) return null;

  const enrollments = await safeQuery(() =>
    prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            category: true,
            _count: { select: { lessons: true } },
          },
        },
      },
    }),
  );

  const enrolledCourseIds = enrollments.map((enrollment) => enrollment.courseId);

  const allCourses = await safeQuery(() =>
    prisma.course.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        category: true,
        _count: { select: { lessons: true } },
      },
    }),
  );

  const enrolledCourses: EnrolledCourse[] = enrollments.map((enrollment) => ({
    id: enrollment.course.id,
    title: enrollment.course.title,
    slug: enrollment.course.slug,
    image: enrollment.course.image,
    category: enrollment.course.category,
    progress: enrollment.progress,
    lessons: enrollment.course._count.lessons,
    enrollmentStatus: enrollment.status,
  }));

  const availableCourses: AvailableCourse[] = allCourses
    .filter((course) => !enrolledCourseIds.includes(course.id))
    .map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      image: course.image,
      category: course.category,
      lessons: course._count.lessons,
    }));

  return { enrolledCourses, availableCourses };
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const user = await getCurrentUserId();
  if (!user) return null;

  const course = await safeQuery(() =>
    prisma.course.findUnique({
      where: { slug },
      select: courseDetailSelect,
    }),
  );

  if (!course) return null;

  const enrollment = await safeQuery(() =>
    prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      select: {
        status: true,
        progress: true,
      },
    }),
  );

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    image: course.image,
    category: course.category,
    description: course.description,
    lessons: course.lessons,
    enrollmentStatus: enrollment?.status ?? null,
    progress: enrollment?.progress ?? null,
  };
}

export async function enrollCourse(slug: string): Promise<CourseDetail | null> {
  const user = await getCurrentUserId();
  if (!user) return null;

  const course = await safeQuery(() => prisma.course.findUnique({ where: { slug } }));
  if (!course) return null;

  const enrollment = await safeQuery(() =>
    prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      create: {
        userId: user.id,
        courseId: course.id,
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
    }),
  );

  const updatedCourse = await safeQuery(() =>
    prisma.course.findUnique({
      where: { slug },
      select: courseDetailSelect,
    }),
  );

  if (!updatedCourse) return null;

  return {
    id: updatedCourse.id,
    title: updatedCourse.title,
    slug: updatedCourse.slug,
    image: updatedCourse.image,
    category: updatedCourse.category,
    description: updatedCourse.description,
    lessons: updatedCourse.lessons,
    enrollmentStatus: enrollment.status,
    progress: enrollment.progress,
  };
}

export async function dropCourse(slug: string): Promise<CourseDetail | null> {
  const user = await getCurrentUserId();
  if (!user) return null;

  const course = await safeQuery(() =>
    prisma.course.findUnique({
      where: { slug },
      select: courseDetailSelect,
    }),
  );

  if (!course) return null;

  await safeQuery(() =>
    prisma.enrollment.deleteMany({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    }),
  );

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    image: course.image,
    category: course.category,
    description: course.description,
    lessons: course.lessons,
    enrollmentStatus: null,
    progress: null,
  };
}
