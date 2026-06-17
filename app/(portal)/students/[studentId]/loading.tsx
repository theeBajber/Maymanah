import { Skeleton, CardSkeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function StudentDetailLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-8 overflow-auto pt-20">
        <section className="bg-bg-card rounded-xl p-6 border border-border">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </section>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </>
  );
}
