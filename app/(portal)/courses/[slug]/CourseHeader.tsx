import type { CourseDetail } from "@/lib/courses";
import { CourseOptions } from "./CourseOptions";

/**
 * The student's lesson-page header.
 *
 * The course name is context rather than the headline: the page is about the
 * lessons, so "Your lessons" leads and the course identity sits beneath it.
 * Course options are quiet on the right; nothing destructive sits next to the
 * join button.
 */
export function CourseHeader({ course }: { course: CourseDetail }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage">
          QURAN HIFDH
        </p>
        <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Your lessons
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {course.title}
          <span aria-hidden> · </span>
          {course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}
          {course.progress > 0 ? (
            <>
              <span aria-hidden> · </span>
              {course.progress}% complete
            </>
          ) : null}
        </p>
      </div>

      <CourseOptions slug={course.slug} courseTitle={course.title} />
    </header>
  );
}
