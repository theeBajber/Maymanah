import { PortalHeader } from "@/app/ui/portal";

export default function CoursesLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8" aria-busy="true" aria-label="Loading courses">
      <PortalHeader title="Courses" subtitle="Structured Hifdh and Tajweed, lesson by lesson" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-bg-elevated">
            <div className="h-28 w-full bg-bg-hover" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-4 w-3/4 rounded bg-bg-hover" />
              <div className="h-1.5 w-full rounded-full bg-bg-hover" />
              <div className="h-3 w-1/3 rounded bg-bg-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
