import { ListSkeleton, Skeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function StudentsLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <ListSkeleton count={4} />
      </div>
    </>
  );
}
