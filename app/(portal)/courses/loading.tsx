import { Skeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function CoursesLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-bg-card rounded-xl border border-border overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
