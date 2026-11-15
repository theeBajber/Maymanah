"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Session page error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-16 text-center">
      <div role="alert" className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-bold text-text-primary">This session could not open</h1>
        <p className="text-sm text-text-secondary">
          Check your connection, then try again. Nothing about the lesson has changed.
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
