export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-bg-hover ${className ?? ""}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-bg-elevated p-4 flex items-center gap-4"
        >
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 space-y-3">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-1/4" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function PortalLoadingShell() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="p-6 space-y-6 max-w-7xl mx-auto pt-24">
        <PageSkeleton />
      </div>
    </div>
  );
}
