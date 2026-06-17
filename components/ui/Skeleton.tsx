export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-bg-hover ${className ?? ""}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="space-y-2 pt-2">
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
          className="bg-bg-card rounded-xl border border-border p-4 flex items-center gap-4"
        >
          <Skeleton className="size-10 rounded-full flex-shrink-0" />
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
    <div className="bg-bg-card rounded-xl border border-border p-6 space-y-3">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-1/4" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <>
      <TopNavSkeleton />
      <div className="flex-1 p-6 space-y-6 overflow-auto pt-20">
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
    </>
  );
}

export function TopNavSkeleton() {
  return (
    <header className="w-full h-16 fixed top-0 left-0 bg-bg-primary px-4 flex items-center justify-between border-b border-border-strong gap-4 z-50">
      <div className="flex items-center gap-2 w-40">
        <Skeleton className="size-8 rounded" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="size-9 rounded-full" />
      </div>
    </header>
  );
}

export function PortalLoadingShell() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-bg-secondary border-r border-border hidden md:flex flex-col p-4 gap-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <PageSkeleton />
      </div>
    </div>
  );
}
