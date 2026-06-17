import { Skeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-bg-card rounded-xl border border-border p-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="bg-bg-card rounded-xl border border-border p-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="bg-bg-card rounded-xl border border-border p-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-2.5 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="size-12 rounded-full" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
