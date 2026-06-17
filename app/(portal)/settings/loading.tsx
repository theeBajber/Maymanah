import { Skeleton, TopNavSkeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-6">
          <div className="hidden md:flex w-48 flex-shrink-0 flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </>
  );
}
