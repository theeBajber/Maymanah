import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function StudentDetailLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="rounded-2xl border border-border bg-bg-elevated p-6">
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
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
