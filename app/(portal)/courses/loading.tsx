import { CardSkeleton } from "@/components/ui/Skeleton";

export default function CoursesLoading() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-bg-hover animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-bg-hover animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
