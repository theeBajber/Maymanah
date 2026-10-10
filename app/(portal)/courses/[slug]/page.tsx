import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { GlassCard } from "@/app/ui/glass";
import { EmptyState, Panel } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { getCourseDetail } from "@/lib/courses";
import { EnrollButton } from "./EnrollButton";
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

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseDetail(await auth(), slug);
  if (!course) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <GlassCard grade="lantern" mashrabiya className="p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage">{course.category}</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">{course.title}</h1>
          {course.description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">{course.description}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <span>{course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}</span>
            {course.averageRating !== null ? (
              <span aria-label={`Rated ${course.averageRating.toFixed(1)} out of 5`}>
                ★ {course.averageRating.toFixed(1)} ({course.reviewCount} {course.reviewCount === 1 ? "review" : "reviews"})
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            {course.enrolled && course.progress > 0 ? (
              <span className="font-semibold text-primary">{course.progress}% complete</span>
            ) : null}
          </div>
          <div className="mt-2">
            <EnrollButton slug={course.slug} isEnrolled={course.enrolled} />
          </div>
        </div>
      </GlassCard>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">Lessons</h2>
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
                    <span className="block text-xs text-text-muted">{lesson.duration} min</span>
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
          <p className="text-sm text-text-secondary">Enrol above to read the lessons and track your progress.</p>
        ) : null}
      </section>

      <ReviewSection slug={course.slug} enrolled={course.enrolled} />
    </div>
  );
}
