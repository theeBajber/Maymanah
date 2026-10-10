"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState, Panel, PortalHeader } from "@/app/ui/portal";

interface SessionItem {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  sessionType: string;
  isTeacher: boolean;
  otherParty: { id: string; name: string | null };
  plan: { fromSurah: number; fromVerse: number; toSurah: number; toVerse: number } | null;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const day =
    date.toDateString() === today.toDateString()
      ? "Today"
      : date.toDateString() === tomorrow.toDateString()
        ? "Tomorrow"
        : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day}, ${time}`;
}

/**
 * The upcoming sessions, soonest first.
 *
 * Reads one endpoint for both roles rather than one per role. Cancelling and
 * rescheduling happen inline: a session that can no longer be changed says so
 * instead of offering buttons that fail.
 */
export function SessionsList() {
  const [sessions, setSessions] = useState<SessionItem[] | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/appointments")
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { sessions?: SessionItem[]; error?: string };
        if (cancelled) return;
        if (!response.ok) {
          setError(body.error ?? "Could not load your sessions.");
          return;
        }
        setSessions(body.sessions ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the server.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    if (!sessions) return null;
    const upcoming = sessions.filter((session) => session.status !== "CANCELLED");
    return upcoming;
  }, [sessions]);

  async function cancel(id: string) {
    setActing(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (response.ok) {
        setSessions((prev) => (prev ?? []).filter((session) => session.id !== id));
      } else {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Could not cancel that session.");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setActing(null);
    }
  }

  if (error && sessions === null) {
    return <EmptyState title={error} />;
  }

  if (grouped === null) {
    return <EmptyState title="Loading your sessions…" />;
  }

  if (grouped.length === 0) {
    return (
      <EmptyState
        title="No sessions booked yet."
        action={
          <p className="mt-2 text-sm text-text-secondary">
            Sessions appear here once booked with a teacher.
          </p>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {grouped.map((session) => (
        <li key={session.id}>
          <Panel className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm font-semibold text-text-primary">
                {session.title ?? `${session.sessionType === "MURAJA" ? "Review" : session.sessionType === "DAILY_HIFDH" ? "Memorisation" : "Session"} with ${session.otherParty.name ?? "your " + (session.isTeacher ? "student" : "teacher")}`}
              </span>
              <span className="text-xs text-text-secondary">{formatWhen(session.startTime)}</span>
              {session.plan ? (
                <span className="text-xs text-text-muted">
                  Surah {session.plan.fromSurah}:{session.plan.fromVerse} → {session.plan.toSurah}:{session.plan.toVerse}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/session/${session.id}`}
                className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90"
              >
                Join
              </Link>
              <button
                onClick={() => cancel(session.id)}
                disabled={acting === session.id}
                className="inline-flex h-10 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
              >
                {acting === session.id ? "Cancelling…" : "Cancel"}
              </button>
            </div>
          </Panel>
        </li>
      ))}
    </ul>
  );
}

export function SessionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <PortalHeader title="Sessions" subtitle="Upcoming, soonest first" />
      <SessionsList />
    </div>
  );
}
