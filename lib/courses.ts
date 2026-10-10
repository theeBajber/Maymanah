import "server-only";

import { db } from "./db";
import { getCurrentUser, type SessionLike } from "./session";

/**
 * Everything a course list needs, computed in as few queries as the shape allows.
 *
 * Progress is read from the cached percentage on the enrollment, never counted
 * per row, so listing twenty courses costs the same as listing two.
 */
export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  image: string | null;
  lessonCount: number;
  enrolled: boolean;
  progress: number;
}

export async function listCourses(session: SessionLike | null): Promise<CourseSummary[]> {
  const user = await getCurrentUser(session);

  const courses = await db.course.findMany({
    where: { isPublished: true, isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      image: true,
      _count: { select: { lessons: { where: { isPublished: true } } } },
      enrollments: user ? { where: { userId: user.id }, select: { progress: true } } : false,
    },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    image: course.image,
    lessonCount: course._count.lessons,
    enrolled: course.enrollments.length > 0,
    progress: course.enrollments[0]?.progress ?? 0,
  }));
}

export interface CourseDetail extends CourseSummary {
  lessons: { id: string; title: string; order: number; duration: number | null; completed: boolean }[];
  averageRating: number | null;
  reviewCount: number;
}

export async function getCourseDetail(
  session: SessionLike | null,
  slug: string,
): Promise<CourseDetail | null> {
  const user = await getCurrentUser(session);

  const course = await db.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      image: true,
      isPublished: true,
      isActive: true,
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true, duration: true },
      },
      enrollments: user ? { where: { userId: user.id }, select: { progress: true } } : false,
      reviews: { select: { rating: true } },
    },
  });

  if (!course || !course.isPublished || !course.isActive) return null;

  const completed = user
    ? await db.lessonProgress.findMany({
        where: { studentId: user.id, lessonId: { in: course.lessons.map((lesson) => lesson.id) }, completed: true },
        select: { lessonId: true },
      })
    : [];
  const done = new Set(completed.map((row) => row.lessonId));

  const ratings = course.reviews.map((review) => review.rating);

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    image: course.image,
    lessonCount: course.lessons.length,
    enrolled: course.enrollments.length > 0,
    progress: course.enrollments[0]?.progress ?? 0,
    lessons: course.lessons.map((lesson) => ({ ...lesson, completed: done.has(lesson.id) })),
    averageRating: ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
    reviewCount: ratings.length,
  };
}

export type EnrollmentFailure = "missing" | "inactive" | "key_required" | "wrong_key";

/**
 * Enrolls the signed-in user, or returns the existing enrollment.
 *
 * Enrolling twice returns the row rather than starting over, so a double
 * submit keeps one history. An enrollment key, when the course has one,
 * gates enrolment; without it anyone may join.
 */
export async function enrollInCourse(
  session: SessionLike | null,
  slug: string,
  key?: string,
): Promise<{ ok: true; id: string } | { ok: false; reason: EnrollmentFailure }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("enrollInCourse requires a signed-in user");

  const course = await db.course.findUnique({ where: { slug }, select: { id: true, isPublished: true, isActive: true, enrollmentKey: true } });
  if (!course || !course.isPublished) return { ok: false, reason: "missing" };
  if (!course.isActive) return { ok: false, reason: "inactive" };

  if (course.enrollmentKey) {
    if (!key) return { ok: false, reason: "key_required" };
    if (key !== course.enrollmentKey) return { ok: false, reason: "wrong_key" };
  }

  const enrollment = await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id },
    update: {},
    select: { id: true },
  });

  return { ok: true, id: enrollment.id };
}

/**
 * Leaves a course.
 *
 * Dropping removes the enrollment row. Lesson progress stays, so rejoining
 * later resumes rather than restarts — the work was done either way.
 */
export async function dropCourse(session: SessionLike | null, slug: string): Promise<boolean> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("dropCourse requires a signed-in user");

  const course = await db.course.findUnique({ where: { slug }, select: { id: true } });
  if (!course) return false;

  const result = await db.enrollment.deleteMany({ where: { userId: user.id, courseId: course.id } });
  return result.count > 0;
}

/**
 * Marks a lesson complete and refreshes the cached course percentage.
 *
 * Requires an active enrollment: progress belongs to a passage through a
 * course, not to a lesson viewed in passing.
 */
export async function completeLesson(
  session: SessionLike | null,
  lessonId: string,
  score?: number,
): Promise<{ ok: true; progress: number } | { ok: false; reason: "missing" | "not_enrolled" }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("completeLesson requires a signed-in user");

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true, isPublished: true },
  });
  if (!lesson || !lesson.isPublished) return { ok: false, reason: "missing" };

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
    select: { id: true, status: true },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") return { ok: false, reason: "not_enrolled" };

  await db.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: user.id, lessonId } },
    create: { studentId: user.id, lessonId, completed: true, score, completedAt: new Date() },
    update: { completed: true, score, completedAt: new Date() },
  });

  const [total, done] = await Promise.all([
    db.lesson.count({ where: { courseId: lesson.courseId, isPublished: true } }),
    db.lessonProgress.count({
      where: { studentId: user.id, completed: true, lesson: { courseId: lesson.courseId, isPublished: true } },
    }),
  ]);

  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const update: { progress: number; status?: "COMPLETED"; completedAt?: Date } = { progress };
  if (progress >= 100) {
    update.status = "COMPLETED";
    update.completedAt = new Date();
  }
  await db.enrollment.update({ where: { id: enrollment.id }, data: update });

  return { ok: true, progress };
}
