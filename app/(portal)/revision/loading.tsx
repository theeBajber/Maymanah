import { Skeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function RevisionLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
        <Skeleton className="h-8 w-40" />
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </>
  );
}
