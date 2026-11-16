import type { CourseDetail } from "@/lib/courses";
import { CourseOptions } from "./CourseOptions";

/**
 * The student's Hifdh session header.
 *
 * The uppercase course kicker already names the course, so the headline is the
 * reader's own schedule. The meta line carries the progress that matters on
 * this course — how much of the Quran is memorised — without repeating "Quran
 * Hifdh" a second time. Course options stay quiet on the right; nothing
 * destructive sits next to the join button.
 */
export function CourseHeader({ course }: { course: CourseDetail }) {
  const meta =
    course.completion === "memorization"
      ? [`${course.progress}% of the Quran memorised`]
      : [
          course.lessonCount > 0
            ? `${course.lessonCount} ${course.lessonCount === 1 ? "session" : "sessions"}`
            : null,
          course.progress > 0 ? `${course.progress}% complete` : null,
        ].filter((part): part is string => part !== null);

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage">
          QURAN HIFDH
        </p>
        <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Your sessions
        </h1>
        {meta.length > 0 ? (
          <p className="mt-2 text-sm text-text-secondary">
            {meta.map((part, index) => (
              <span key={part}>
                {index > 0 ? <span aria-hidden> · </span> : null}
                {part}
              </span>
            ))}
          </p>
        ) : null}
      </div>

      <CourseOptions slug={course.slug} courseTitle={course.title} />
    </header>
  );
}
