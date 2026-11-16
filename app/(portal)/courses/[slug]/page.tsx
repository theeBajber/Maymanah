import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";

import { GlassCard } from "@/app/ui/glass";
import { EmptyState, Panel } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { HIFDH_SLUG } from "@/lib/course-completion";
import { getCourseDetail } from "@/lib/courses";
import { CourseIdentity } from "./CourseIdentity";
import { HifdhCourse, HifdhCourseLoading } from "./HifdhCourse";
import { ReviewSection } from "./ReviewSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseDetail(await auth(), slug);
  if (!course) return { title: "Course" };
  return {
    title: course.title,
    description: course.description ?? `Study ${course.title} lesson by lesson.`,
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const course = await getCourseDetail(await auth(), slug);
  if (!course) notFound();

  const query = searchParams ? await searchParams : {};
  const isTest = process.env.TEST_MODE === "true" && (query.test === "1" || query.test === "true");
  const isHifdh = course.slug === HIFDH_SLUG;
  // The course ends at the review; the exam comes first when one exists. A
  // course with no final exam goes straight from the lessons to the review.
  const reviewReady = course.completed && (!course.hasFinalExam || course.finalExamPassed);
  const certificateReady = Boolean(course.certificate && course.myReview);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      {isHifdh ? (
        course.enrolled ? (
          // The course name and description paint immediately; the live session
          // panel streams in once the pairing and progress have been read.
          <Suspense fallback={<HifdhCourseLoading course={course} />}>
            <HifdhCourse course={course} isTest={isTest} showAll={query.show === "all"} />
          </Suspense>
        ) : (
          <GlassCard grade="lantern" mashrabiya className="p-6 md:p-8">
            <CourseIdentity course={course} showLessons={false} />
          </GlassCard>
        )
      ) : (
        <>
          <GlassCard grade="lantern" mashrabiya className="p-6 md:p-8">
            <CourseIdentity course={course} />
          </GlassCard>

          <section id="curriculum" className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-text-primary">Curriculum</h2>
            {course.lessons.length === 0 ? (
              <EmptyState title="Lessons are being written for this course." />
            ) : (
              <Panel className="divide-y divide-border">
                {course.lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={course.enrolled ? `/courses/${course.slug}/lessons/${lesson.id}` : `/courses/${course.slug}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-bg-hover"
                    aria-label={course.enrolled ? undefined : `${lesson.title} (enrol to read)`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border text-sm font-bold tabular-nums text-text-secondary">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-text-primary">{lesson.title}</span>
                      {lesson.duration ? (
                        <span className="block text-xs text-text-secondary">{lesson.duration} min</span>
                      ) : null}
                    </span>
                    {lesson.completed ? (
                      <span className="shrink-0 rounded-full bg-night-success/15 px-2.5 py-1 text-[11px] font-semibold text-night-success">
                        Done
                      </span>
                    ) : null}
                  </Link>
                ))}
              </Panel>
            )}
            {!course.enrolled && course.lessons.length > 0 ? (
              <p className="text-sm text-text-secondary">
                {course.enrollmentOpen
                  ? "Enrol above to read the lessons and track your progress."
                  : course.requiresMentor && course.seatsAvailable === 0
                    ? "Every teaching seat is currently taken. Places open when a student completes or leaves, so check back soon."
                    : "This course is coming soon. Enrolment has not opened yet."}
              </p>
            ) : null}
          </section>
        </>
      )}

      {course.completed && course.hasFinalExam ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-text-primary">Final Exam</h2>
          <Panel className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {course.finalExamPassed ? "Final exam passed" : "Ready to be tested?"}
              </p>
              <p className="text-sm text-text-secondary">
                {course.finalExamPassed
                  ? "Your result is recorded. The course review is the last step before your certificate."
                  : course.completion === "memorization"
                    ? "You have memorised the whole Quran. Sit the final exam to unlock the course review and certificate."
                    : "You have completed every lesson. Sit the final exam to unlock the course review and certificate."}
              </p>
            </div>
            <Link
              href={`/courses/${course.slug}/exam`}
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-text-inverse transition-all hover:bg-primary-dark"
            >
              {course.finalExamPassed ? "View Exam Result" : "Go to Final Exam"}
            </Link>
          </Panel>
        </section>
      ) : null}

      {reviewReady ? (
        <ReviewSection
          slug={course.slug}
          initialRating={course.myReview?.rating ?? 0}
          initialComment={course.myReview?.comment ?? ""}
          hasReview={Boolean(course.myReview)}
        />
      ) : null}

      {certificateReady && course.certificate ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-text-primary">Certificate</h2>
          <Panel className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Certificate earned</p>
              <p className="text-sm text-text-secondary">View and download your course certificate.</p>
            </div>
            <Link
              href={`/certificates/${course.certificate.id}`}
              className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-text-inverse transition-all hover:brightness-95"
            >
              View Certificate
            </Link>
          </Panel>
        </section>
      ) : null}
    </div>
  );
}
