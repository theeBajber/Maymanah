"use client";

import { CheckCircle2, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { GlassCard } from "@/app/ui/glass";
import { LocalTime } from "@/app/ui/LocalTime";
import { EmptyState, Panel, PortalHeader } from "@/app/ui/portal";
import {
  SessionRowCard,
  TipsPanel,
  TodayLessonCard,
  type PendingReportRow,
  type SessionRow,
} from "@/app/ui/session-cards";
import { useToast } from "@/app/ui/toast";
import { localDayKey, pickFeaturedSession, sessionTypeLabel } from "@/lib/live-session";

/**
 * The teacher's schedule screen.
 *
 * Students now meet their lessons on the Hifdh course page, so this view is
 * deliberately only the teaching side: what is next, what needs a report, and
 * how to join.
 */
export function SessionsView({
  name,
  sessions,
  pendingReports,
}: {
  name: string;
  sessions: SessionRow[];
  pendingReports: PendingReportRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);

  useEffect(() => {
    // The browser's calendar day is only known after mount; the server's date
    // must not decide which lesson is "today".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayKey(localDayKey(new Date()));
  }, []);

  const active = useMemo(
    () => sessions.filter((session) => !cancelled.includes(session.id)),
    [sessions, cancelled],
  );

  const today = useMemo(
    () =>
      todayKey
        ? active.filter((session) => localDayKey(new Date(session.startTime)) === todayKey)
        : [],
    [active, todayKey],
  );

  const hero = pickFeaturedSession(active, todayKey);
  const heroIsToday = Boolean(hero && today.some((session) => session.id === hero.id));
  const upcoming = active.filter(
    (session) =>
      session.id !== hero?.id &&
      (session.joinState === "upcoming" || session.joinState === "open"),
  );
  const endedToday = today.filter(
    (session) => session.id !== hero?.id && session.joinState === "ended",
  );

  async function cancel(session: SessionRow) {
    const when = new Date(session.startTime).toLocaleString();
    if (!window.confirm(`Cancel the session on ${when}? This cannot be undone.`)) return;

    setCancelling(session.id);
    try {
      const response = await fetch(`/api/appointments/${session.id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        toast({ title: body.error ?? "Could not cancel that session", variant: "error" });
        return;
      }

      setCancelled((current) => [...current, session.id]);
      toast({ title: "Session cancelled", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setCancelling(null);
    }
  }

  const firstName = name.split(" ")[0] ?? name;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PortalHeader
        title="Sessions"
        subtitle={`Salaam, ${firstName}. Your teaching schedule, and any reports still to write.`}
      />

      {hero ? (
        <GlassCard grade="lantern" mashrabiya className="p-5 sm:p-6">
          <div className="relative">
            <TodayLessonCard session={hero} isTeacher today={heroIsToday} />
          </div>
        </GlassCard>
      ) : (
        <EmptyState
          title={
            active.length === 0
              ? "No sessions booked yet."
              : "No upcoming sessions right now."
          }
          action={
            <p className="mt-2 text-sm text-text-secondary">
              {active.length === 0
                ? "Sessions appear here once your availability is booked."
                : "Past sessions stay available from their session page."}
            </p>
          }
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-4 lg:order-2">
          <PendingReports rows={pendingReports} />
          <TipsPanel />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:order-1">
          {upcoming.length > 0 ? (
            <section className="flex flex-col gap-3" aria-labelledby="coming-up">
              <h2
                id="coming-up"
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
              >
                Coming up
              </h2>
              <ul className="flex flex-col gap-3">
                {upcoming.map((session) => (
                  <li key={session.id}>
                    <SessionRowCard
                      session={session}
                      cancelling={cancelling === session.id}
                      onCancel={() => cancel(session)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {endedToday.length > 0 ? (
            <section className="flex flex-col gap-3" aria-labelledby="earlier-today">
              <h2
                id="earlier-today"
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
              >
                Earlier today
              </h2>
              <ul className="flex flex-col gap-3">
                {endedToday.map((session) => (
                  <li key={session.id}>
                    <SessionRowCard
                      session={session}
                      cancelling={false}
                      onCancel={() => cancel(session)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PendingReports({ rows }: { rows: PendingReportRow[] }) {
  return (
    <Panel className="flex flex-col gap-3 p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        <ClipboardCheck aria-hidden className="size-3.5" />
        Reports to finish
      </p>

      {rows.length === 0 ? (
        <div className="flex items-start gap-2">
          <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
          <p className="text-sm text-text-secondary">
            Nothing waiting. Finished sessions appear here until their report is written.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/session/${row.id}#report`}
                className="flex min-h-11 flex-col gap-0.5 rounded-xl border border-border px-3 py-2.5 transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-text-primary">
                    {row.studentName}
                  </span>
                  <span className="shrink-0 text-xs text-text-secondary">
                    <LocalTime iso={row.startTime} mode="date-short" />
                  </span>
                </span>
                <span className="truncate text-xs text-text-secondary">
                  {sessionTypeLabel(row.sessionType)}
                  {row.title ? ` · ${row.title}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
