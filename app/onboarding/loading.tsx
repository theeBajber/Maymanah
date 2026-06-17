import { Skeleton } from "@/components/ui/Skeleton";

export default function OnboardingLoading() {
  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="text-center space-y-3">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <div className="bg-bg-card rounded-2xl border border-border p-8 space-y-5">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
