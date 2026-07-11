import { CardSkeleton } from "@/components/ui/Skeleton";

export default function AvailabilityLoading() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-bg-hover animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-bg-hover animate-pulse" />
      </div>
      <CardSkeleton />
    </div>
  );
}
