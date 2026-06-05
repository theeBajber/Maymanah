import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export type CoursesData = {
  enrolledCourses: EnrolledCourse[];
  availableCourses: AvailableCourse[];
};

export async function getCoursesData(): Promise<CoursesData | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrollments: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
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
      },
    },
  });

  if (!user) {
    return null;
  }

  const enrolledCourseIds = user.enrollments.map((e) => e.courseId);

  const allCourses = await prisma.course.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      image: true,
      category: true,
      _count: { select: { lessons: true } },
    },
  });

  const enrolledCourses: EnrolledCourse[] = user.enrollments.map((e) => ({
    id: e.course.id,
    title: e.course.title,
    slug: e.course.slug,
    image: e.course.image,
    category: e.course.category,
    progress: e.progress,
    lessons: e.course._count.lessons,
    enrollmentStatus: e.status,
  }));

  const availableCourses: AvailableCourse[] = allCourses
    .filter((c) => !enrolledCourseIds.includes(c.id))
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      image: c.image,
      category: c.category,
      lessons: c._count.lessons,
    }));

  return { enrolledCourses, availableCourses };
}