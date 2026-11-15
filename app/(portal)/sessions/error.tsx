"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SessionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sessions page error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-16 text-center">
      <div role="alert" className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-bold text-text-primary">Your sessions could not load</h1>
        <p className="text-sm text-text-secondary">
          This is usually temporary. Try again, or return to your dashboard.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90"
        >
          <RefreshCw aria-hidden className="size-4" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center rounded-[10px] border border-border px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
