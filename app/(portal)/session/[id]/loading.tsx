export default function SessionLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8"
      aria-busy="true"
      aria-label="Loading session"
    >
      <div className="h-4 w-24 animate-pulse rounded bg-bg-hover" />

      <div className="animate-pulse rounded-2xl border border-border bg-bg-elevated p-6">
        <div className="h-3 w-32 rounded bg-bg-hover" />
        <div className="mt-3 h-7 w-2/3 rounded bg-bg-hover" />
        <div className="mt-2 h-4 w-1/2 rounded bg-bg-hover" />
        <div className="mt-5 flex gap-2">
          <div className="h-6 w-24 rounded-full bg-bg-hover" />
          <div className="h-6 w-20 rounded-full bg-bg-hover" />
        </div>
        <div className="mt-6 h-12 w-full rounded-[10px] bg-bg-hover sm:w-48" />
      </div>

      <div className="animate-pulse rounded-2xl border border-border bg-bg-elevated p-5">
        <div className="h-3 w-28 rounded bg-bg-hover" />
        <div className="mt-3 h-4 w-3/4 rounded bg-bg-hover" />
        <div className="mt-2 h-4 w-1/2 rounded bg-bg-hover" />
      </div>
    </div>
  );
}
