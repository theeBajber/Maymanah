import "server-only";

import { issueCertificate } from "./certificate";
import { db } from "./db";
import { availableSeats, releaseStudentSeats, reserveMentor } from "./mentoring";
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
  enrollmentOpen: boolean;
  /** Whether joining takes one of a teacher's limited seats. */
  requiresMentor: boolean;
  /**
   * Free teaching seats across the teachers this reader could be paired with.
   * Null when the course does not use mentors, or when the reader is not signed
   * in and their gender is therefore unknown.
   */
  seatsAvailable: number | null;
}

/**
 * Free seats for this reader, or null when the answer is not theirs to see.
 *
 * Capacity is gendered, so an anonymous visitor cannot be shown a truthful
 * count. They see the course as open and are told the real position after
 * signing in.
 */
async function mentorSeatsFor(user: { gender: string | null } | null): Promise<number | null> {
  if (!user?.gender) return null;
  return availableSeats(user.gender);
}

export async function listCourses(session: SessionLike | null): Promise<CourseSummary[]> {
  const user = await getCurrentUser(session);

  const courses = await db.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      image: true,
      isActive: true,
      requiresMentor: true,
      _count: { select: { lessons: { where: { isPublished: true } } } },
      enrollments: user ? { where: { userId: user.id }, select: { progress: true } } : false,
    },
  });

  // Capacity is shared by every mentor course, so it is counted once rather
  // than once per row.
  const mentorSeats = courses.some((course) => course.requiresMentor) ? await mentorSeatsFor(user) : null;

  return courses.map((course) => {
    const enrolled = course.enrollments.length > 0;
    const seatsAvailable = course.requiresMentor ? mentorSeats : null;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      image: course.image,
      lessonCount: course._count.lessons,
      enrolled,
      progress: course.enrollments[0]?.progress ?? 0,
      enrollmentOpen: course.isActive && (!course.requiresMentor || enrolled || seatsAvailable !== 0),
      requiresMentor: course.requiresMentor,
      seatsAvailable,
    };
  });
}

export interface CourseDetail extends CourseSummary {
  lessons: { id: string; title: string; order: number; duration: number | null; completed: boolean }[];
  averageRating: number | null;
  reviewCount: number;
  certificate: { id: string } | null;
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
      requiresMentor: true,
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true, duration: true },
      },
      enrollments: user ? { where: { userId: user.id }, select: { progress: true } } : false,
      reviews: { select: { rating: true } },
    },
  });

  if (!course || !course.isPublished) return null;

  // These three reads are independent; running them together saves two round
  // trips on every course visit.
  const [completed, certificate, seatsAvailable] = await Promise.all([
    user
      ? db.lessonProgress.findMany({
          where: { studentId: user.id, lessonId: { in: course.lessons.map((lesson) => lesson.id) }, completed: true },
          select: { lessonId: true },
        })
      : [],
    user
      ? db.ijazah.findUnique({
          where: { userId_courseId: { userId: user.id, courseId: course.id } },
          select: { id: true },
        })
      : null,
    course.requiresMentor ? mentorSeatsFor(user) : null,
  ]);
  const done = new Set(completed.map((row) => row.lessonId));

  const ratings = course.reviews.map((review) => review.rating);
  const enrolled = course.enrollments.length > 0;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    image: course.image,
    lessonCount: course.lessons.length,
    enrolled,
    progress: course.enrollments[0]?.progress ?? 0,
    enrollmentOpen: course.isActive && (!course.requiresMentor || enrolled || seatsAvailable !== 0),
    requiresMentor: course.requiresMentor,
    seatsAvailable,
    lessons: course.lessons.map((lesson) => ({ ...lesson, completed: done.has(lesson.id) })),
    averageRating: ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
    reviewCount: ratings.length,
    certificate,
  };
}

export type EnrollmentFailure =
  | "missing"
  | "inactive"
  | "key_required"
  | "wrong_key"
  | "full"
  | "gender_missing"
  | "not_student"
  | "disabled";

/**
 * Enrolls the signed-in user, or returns the existing enrollment.
 *
 * Enrolling twice returns the row rather than starting over, so a double
 * submit keeps one history. An enrollment key, when the course has one,
 * gates enrolment; without it anyone may join.
 *
 * A course taught one-to-one also claims a teaching seat at the same moment.
 * The seat is a reservation until a timetable exists, so a student who enrols
 * and then disappears holds capacity for a limited time rather than forever.
 * No seat means no enrolment: there is no waitlist.
 */
export async function enrollInCourse(
  session: SessionLike | null,
  slug: string,
  key?: string,
): Promise<{ ok: true; id: string } | { ok: false; reason: EnrollmentFailure }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("enrollInCourse requires a signed-in user");

  if (user.standing === "DISABLED") return { ok: false, reason: "disabled" };

  const course = await db.course.findUnique({
    where: { slug },
    select: {
      id: true,
      isPublished: true,
      isActive: true,
      enrollmentKey: true,
      requiresMentor: true,
    },
  });
  if (!course || !course.isPublished) return { ok: false, reason: "missing" };
  if (!course.isActive) return { ok: false, reason: "inactive" };

  if (course.enrollmentKey) {
    if (!key) return { ok: false, reason: "key_required" };
    if (key !== course.enrollmentKey) return { ok: false, reason: "wrong_key" };
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { id: true },
  });
  if (existing) return { ok: true, id: existing.id };

  if (course.requiresMentor) {
    const seat = await reserveMentor(user.id);
    if (!seat.ok) {
      if (seat.reason === "gender_missing" || seat.reason === "not_student") {
        return { ok: false, reason: seat.reason };
      }
      return { ok: false, reason: "full" };
    }
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
 * later resumes rather than restarts — the work was done either way. Leaving
 * the last mentor-taught course gives the teaching seat back, along with the
 * sessions that were planned against it.
 */
export async function dropCourse(session: SessionLike | null, slug: string): Promise<boolean> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("dropCourse requires a signed-in user");

  const course = await db.course.findUnique({ where: { slug }, select: { id: true, requiresMentor: true } });
  if (!course) return false;

  const result = await db.enrollment.deleteMany({ where: { userId: user.id, courseId: course.id } });
  if (result.count === 0) return false;

  if (course.requiresMentor) {
    const remaining = await db.enrollment.count({
      where: { userId: user.id, course: { requiresMentor: true } },
    });
    if (remaining === 0) {
      await releaseStudentSeats(user.id, "course_dropped");
    }
  }

  return true;
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
    select: { id: true, courseId: true, isPublished: true, course: { select: { isPublished: true } } },
  });
  if (!lesson || !lesson.isPublished || !lesson.course.isPublished) return { ok: false, reason: "missing" };

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

  // Finishing every lesson issues the certificate. Idempotent, so completing
  // the last lesson twice still yields one certificate.
  if (progress >= 100) {
    await issueCertificate(user.id, lesson.courseId);
  }

  return { ok: true, progress };
}
