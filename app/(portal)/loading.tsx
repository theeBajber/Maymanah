import { PageSkeleton } from "@/components/ui/Skeleton";

export default function PortalLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageSkeleton />
    </div>
  );
}
