/**
 * The course screen's own loading frame.
 *
 * Without it this route inherited the catalogue skeleton, so navigating from
 * /courses flashed the course grid before the page could draw. It stays
 * deliberately plain: a loading component cannot know which course it stands
 * for, so it promises position, not content — no hero pattern to be wrong
 * about once the real page arrives.
 */
export default function CourseLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8"
      aria-busy="true"
      aria-label="Loading course"
    >
      <div className="flex flex-col gap-3">
        <div className="h-3 w-28 rounded-full bg-bg-hover motion-safe:animate-pulse" />
        <div className="h-9 w-64 max-w-full rounded-lg bg-bg-hover motion-safe:animate-pulse" />
        <div className="h-4 w-44 rounded bg-bg-hover motion-safe:animate-pulse" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
          <div className="h-6 w-32 rounded-full bg-bg-hover motion-safe:animate-pulse" />
          <div className="h-14 w-44 rounded-lg bg-bg-hover motion-safe:animate-pulse" />
          <div className="h-4 w-64 max-w-full rounded bg-bg-hover motion-safe:animate-pulse" />
          <div className="mt-2 h-10 w-40 rounded-full bg-bg-hover motion-safe:animate-pulse" />
          <div className="h-12 w-full max-w-xs rounded-[10px] bg-bg-hover motion-safe:animate-pulse" />
        </div>
        <div className="h-64 rounded-2xl border border-border bg-bg-elevated motion-safe:animate-pulse" />
      </div>

      <div className="h-52 rounded-2xl border border-border bg-bg-elevated motion-safe:animate-pulse" />

      <span className="sr-only" role="status">
        Loading the course.
      </span>
    </div>
  );
}
