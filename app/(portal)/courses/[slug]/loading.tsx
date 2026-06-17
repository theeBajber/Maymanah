import { Skeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function CourseDetailLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="w-full md:w-1/3 h-64 md:h-80 rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </>
  );
}
