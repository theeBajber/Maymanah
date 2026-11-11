"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/ui/toast";

interface QueueEvent {
  id: string;
  createdAt: Date | string;
  reason: string;
  absenceCount: number | null;
  previousStanding: string;
  user: { id: string; name: string; email: string; role: string; standing: string };
}

export function StandingQueue({ events }: { events: QueueEvent[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(id: string, action: "confirm" | "dismiss") {
    setBusy(id);
    try {
      const response = await fetch(`/api/admin/standing/${id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        toast({ title: body.error ?? "Could not record that decision", variant: "error" });
        return;
      }
      toast({
        title: action === "confirm" ? "Account disabled" : "Proposal dismissed",
        variant: "success",
      });
      router.refresh();
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-text-secondary">No disables are waiting for review.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
      <ul className="divide-y divide-border">
        {events.map((event) => (
          <li key={event.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{event.user.name}</p>
              <p className="truncate text-xs text-text-secondary">{event.user.email}</p>
              <p className="mt-2 text-xs text-text-secondary">
                {event.reason} Proposed on{" "}
                {new Date(event.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                .
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                {event.user.role} · {event.previousStanding} → DISABLED
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => decide(event.id, "dismiss")}
                disabled={busy === event.id}
                className="inline-flex h-9 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
              >
                Dismiss
              </button>
              <button
                onClick={() => decide(event.id, "confirm")}
                disabled={busy === event.id}
                className="inline-flex h-9 items-center rounded-[10px] bg-danger px-4 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
              >
                {busy === event.id ? "Saving…" : "Disable account"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
