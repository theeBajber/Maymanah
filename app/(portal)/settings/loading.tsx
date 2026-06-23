import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-6">
        <div className="hidden md:flex w-48 shrink-0 flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
