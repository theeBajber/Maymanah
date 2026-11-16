import "server-only";

import { completionModeFor, evaluateCompletion, type CompletionMode } from "./course-completion";
import { db } from "./db";
import { didPassExam } from "./exams";
import { availableSeats, releaseStudentSeats, reserveMentor } from "./mentoring";
import { memorizationProgress } from "./quran-progress";
import { getCurrentUser, type SessionLike } from "./session";

/**
 * Everything a course list needs, computed in as few queries as the shape allows.
 *
 * Lesson progress is read from the cached percentage on the enrollment, never
 * counted per row, so listing twenty courses costs the same as listing two.
 * Memorisation is one extra read for the whole list, because it belongs to the
 * student rather than to a single course.
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
  /** What `progress` measures, and what finishing this course means. */
  completion: CompletionMode;
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

  // Memorisation belongs to the student, not the course, so one read covers
  // every memorisation-track card in the list.
  const memorized =
    user && courses.some((course) => course.enrollments.length > 0 && completionModeFor(course.slug) === "memorization")
      ? await memorizationProgress(user.id)
      : null;

  return courses.map((course) => {
    const enrolled = course.enrollments.length > 0;
    const completion = completionModeFor(course.slug);
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
      progress: enrolled
        ? completion === "memorization"
          ? memorized?.percent ?? 0
          : course.enrollments[0]?.progress ?? 0
        : 0,
      completion,
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
  /** Published lessons the reader has finished. */
  completedLessons: number;
  /** The course's own finish line: all lessons, or the whole Quran. */
  completed: boolean;
  /** A published final exam exists, and whether the reader has passed it. */
  hasFinalExam: boolean;
  finalExamPassed: boolean;
  /** The reader's own verdict, when they have already rated the course. */
  myReview: { rating: number; comment: string | null } | null;
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

  const completion = completionModeFor(course.slug);

  // These reads are independent; running them together saves round trips on
  // every course visit. A memorisation course reads the student's Quran ledger
  // instead of the hidden lesson rows.
  const [completed, certificate, seatsAvailable, finalExam, myReview, memorized] = await Promise.all([
    user && completion === "lessons"
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
    user
      ? db.exam.findFirst({
          where: { courseId: course.id, examType: "FINAL", isPublished: true },
          select: {
            passMark: true,
            questions: { select: { marks: true } },
            submissions: {
              where: { studentId: user.id, status: { in: ["SUBMITTED", "GRADED"] } },
              orderBy: { attemptNumber: "desc" },
              take: 1,
              select: { status: true, totalScore: true },
            },
          },
        })
      : null,
    user
      ? db.courseReview.findUnique({
          where: { userId_courseId: { userId: user.id, courseId: course.id } },
          select: { rating: true, comment: true },
        })
      : null,
    user && completion === "memorization" ? memorizationProgress(user.id) : null,
  ]);
  const done = new Set(completed.map((row) => row.lessonId));

  const ratings = course.reviews.map((review) => review.rating);
  const enrolled = course.enrollments.length > 0;

  const completedLessons = course.lessons.filter((lesson) => done.has(lesson.id)).length;
  const completionState = evaluateCompletion({
    mode: completion,
    completedLessons,
    lessonCount: course.lessons.length,
    memorizedAyahs: memorized?.uniqueAyahs ?? 0,
  });
  const finalMarks = finalExam?.questions.reduce((sum, question) => sum + question.marks, 0) ?? 0;
  const latestAttempt = finalExam?.submissions[0] ?? null;
  const finalExamPassed = Boolean(
    finalExam &&
      latestAttempt?.status === "GRADED" &&
      didPassExam(latestAttempt.totalScore, finalMarks, finalExam.passMark),
  );

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    image: course.image,
    lessonCount: course.lessons.length,
    enrolled,
    progress: enrolled ? completionState.progress : 0,
    completion,
    enrollmentOpen: course.isActive && (!course.requiresMentor || enrolled || seatsAvailable !== 0),
    requiresMentor: course.requiresMentor,
    seatsAvailable,
    lessons: course.lessons.map((lesson) => ({ ...lesson, completed: done.has(lesson.id) })),
    averageRating: ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
    reviewCount: ratings.length,
    certificate,
    completedLessons,
    completed: enrolled && completionState.completed,
    hasFinalExam: Boolean(finalExam),
    finalExamPassed,
    myReview,
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

  // Finishing the lessons completes the course. The certificate waits for the
  // final exam and the review, so it is issued by the review endpoint instead.
  return { ok: true, progress };
}
