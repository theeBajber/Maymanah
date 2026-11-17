/**
 * The exam screen's loading frame.
 *
 * A single panel, so the exam route does not inherit the course page's
 * two-column frame while its result is being read.
 */
export default function ExamLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8"
      aria-busy="true"
      aria-label="Loading exam"
    >
      <div className="flex flex-col gap-3">
        <div className="h-3 w-24 rounded-full bg-bg-hover motion-safe:animate-pulse" />
        <div className="h-9 w-56 max-w-full rounded-lg bg-bg-hover motion-safe:animate-pulse" />
      </div>

      <div className="h-72 rounded-2xl border border-border bg-bg-elevated motion-safe:animate-pulse" />

      <span className="sr-only" role="status">
        Loading the exam.
      </span>
    </div>
  );
}
