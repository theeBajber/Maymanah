import { Skeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function AvailabilityLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-10 mx-auto" />
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-full rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
