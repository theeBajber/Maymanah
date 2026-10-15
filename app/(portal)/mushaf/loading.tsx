import { PortalHeader } from "@/app/ui/portal";

export default function MushafLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8" aria-busy="true" aria-label="Loading Mushaf">
      <PortalHeader title="Mushaf" subtitle="Read with recitation audio" />
      <div className="animate-pulse rounded-2xl border border-border bg-bg-elevated p-6">
        <div className="h-6 w-2/3 rounded bg-bg-hover" />
        <div className="mt-4 h-6 w-full rounded bg-bg-hover" />
        <div className="mt-2 h-6 w-5/6 rounded bg-bg-hover" />
      </div>
    </div>
  );
}
