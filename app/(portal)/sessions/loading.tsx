import { PortalHeader } from "@/app/ui/portal";

export default function SessionsLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8"
      aria-busy="true"
      aria-label="Loading your sessions"
    >
      <PortalHeader title="Sessions" subtitle="Today's session, and what comes next" />

      <div className="animate-pulse rounded-2xl border border-border bg-bg-elevated p-6">
        <div className="h-3 w-28 rounded bg-bg-hover" />
        <div className="mt-3 h-9 w-40 rounded bg-bg-hover" />
        <div className="mt-2 h-4 w-56 rounded bg-bg-hover" />
        <div className="mt-2 h-4 w-72 rounded bg-bg-hover" />
        <div className="mt-6 h-12 w-full rounded-[10px] bg-bg-hover sm:w-52" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-24 rounded bg-bg-hover" />
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 rounded-2xl border border-border bg-bg-elevated p-4"
            >
              <div className="h-14 w-16 shrink-0 rounded-xl bg-bg-hover" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-bg-hover" />
                <div className="h-3 w-1/2 rounded bg-bg-hover" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="animate-pulse rounded-2xl border border-border bg-bg-elevated p-5">
            <div className="h-3 w-24 rounded bg-bg-hover" />
            <div className="mt-3 h-5 w-2/3 rounded bg-bg-hover" />
            <div className="mt-3 h-1.5 w-full rounded-full bg-bg-hover" />
          </div>
        </div>
      </div>
    </div>
  );
}
