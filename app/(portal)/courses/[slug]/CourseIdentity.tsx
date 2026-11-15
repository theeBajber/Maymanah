import type { CourseDetail } from "@/lib/courses";
import { EnrollButton } from "./EnrollButton";

/**
 * The course's name, description, and enrol/leave control.
 *
 * Kept separate from the surrounding surface so the Hifdh page can put its
 * live-session controls in the same lantern hero, while every other course
 * keeps the quieter identity-only card.
 */
export function CourseIdentity({ course }: { course: CourseDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage">
          {course.category}
        </p>
        {!course.enrollmentOpen ? (
          <span className="rounded-full bg-warning-muted px-2.5 py-1 text-[11px] font-semibold text-warning">
            {course.requiresMentor && course.seatsAvailable === 0 ? "Fully booked" : "Coming soon"}
          </span>
        ) : null}
      </div>

      <h1 className="text-balance text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
        {course.title}
      </h1>

      {course.description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          {course.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
        <span>
          {course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"}
        </span>
        {course.averageRating !== null ? (
          <span aria-label={`Rated ${course.averageRating.toFixed(1)} out of 5`}>
            ★ {course.averageRating.toFixed(1)} ({course.reviewCount}{" "}
            {course.reviewCount === 1 ? "review" : "reviews"})
          </span>
        ) : (
          <span>No reviews yet</span>
        )}
        {course.enrolled && course.progress > 0 ? (
          <span className="font-semibold text-primary">{course.progress}% complete</span>
        ) : null}
        {course.requiresMentor && !course.enrolled && course.seatsAvailable !== null ? (
          <span>
            {course.seatsAvailable === 0
              ? "No teaching seats free"
              : `${course.seatsAvailable} teaching ${course.seatsAvailable === 1 ? "seat" : "seats"} left`}
          </span>
        ) : null}
      </div>

      <div className="mt-1">
        <EnrollButton
          slug={course.slug}
          isEnrolled={course.enrolled}
          enrollmentOpen={course.enrollmentOpen}
          requiresMentor={course.requiresMentor}
          seatsAvailable={course.seatsAvailable}
        />
      </div>
    </div>
  );
}
