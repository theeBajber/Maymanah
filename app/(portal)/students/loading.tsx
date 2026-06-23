import { ListSkeleton } from "@/components/ui/Skeleton";

export default function StudentsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-bg-hover animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-bg-hover animate-pulse" />
      </div>
      <ListSkeleton count={5} />
    </div>
  );
}
