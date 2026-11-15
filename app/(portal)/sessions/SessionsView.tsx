"use client";

import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { GlassCard } from "@/app/ui/glass";
import { LessonJoinCard } from "@/app/ui/LessonJoinCard";
import { LocalTime } from "@/app/ui/LocalTime";
import { StatusChip, type StatusTone } from "@/app/ui/chips";
import { EmptyState, Panel, PortalHeader } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";
import { sessionTypeLabel, type JoinState } from "@/lib/live-session";
import type { PendingReportRow, ProgressSummary, SessionRow } from "./types";

const JOIN_CHIP: Record<JoinState, { label: string; tone: StatusTone }> = {
  open: { label: "Room open", tone: "success" },
  upcoming: { label: "Upcoming", tone: "info" },
  ended: { label: "Ended", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Picks the lesson the screen leads with.
 *
 * A room that is open right now wins. Otherwise today's earliest upcoming
 * lesson leads, then the one that just ended today, then the next one on the
 * calendar. "Today" is decided in the browser's timezone after mount so a
 * lesson near midnight is not assigned to the wrong day.
 */
function pickHero(sessions: SessionRow[], today: SessionRow[]): SessionRow | null {
  const open = sessions.find((session) => session.joinState === "open");
  if (open) return open;

  const todayUpcoming = today.find((session) => session.joinState === "upcoming");
  if (todayUpcoming) return todayUpcoming;

  const todayEnded = today.filter((session) => session.joinState === "ended");
  if (todayEnded.length > 0) return todayEnded[todayEnded.length - 1];

  return sessions.find((session) => session.joinState === "upcoming") ?? null;
}

export function SessionsView({
  name,
  isTeacher,
  sessions,
  progress,
  pendingReports,
  totalAyahs,
}: {
  name: string;
  isTeacher: boolean;
  sessions: SessionRow[];
  progress: ProgressSummary | null;
  pendingReports: PendingReportRow[];
  totalAyahs: number;
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
    setTodayKey(dayKey(new Date()));
  }, []);

  const active = useMemo(
    () => sessions.filter((session) => !cancelled.includes(session.id)),
    [sessions, cancelled],
  );

  const today = useMemo(
    () =>
      todayKey
        ? active.filter((session) => dayKey(new Date(session.startTime)) === todayKey)
        : [],
    [active, todayKey],
  );

  const hero = pickHero(active, today);
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
    if (!window.confirm(`Cancel the lesson on ${when}? This cannot be undone.`)) return;

    setCancelling(session.id);
    try {
      const response = await fetch(`/api/appointments/${session.id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        toast({ title: body.error ?? "Could not cancel that lesson", variant: "error" });
        return;
      }

      setCancelled((current) => [...current, session.id]);
      toast({ title: "Lesson cancelled", variant: "success" });
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
        title={isTeacher ? "Sessions" : "Lessons"}
        subtitle={
          isTeacher
            ? "Your teaching schedule, and any reports still to write."
            : `Salaam, ${firstName}. Here is your next lesson and how far you have come.`
        }
      />

      {hero ? (
        <LessonHero
          session={hero}
          isTeacher={isTeacher}
          today={heroIsToday}
        />
      ) : (
        <EmptyState
          title={
            active.length === 0
              ? "No lessons booked yet."
              : "No upcoming lessons right now."
          }
          action={
            <p className="mt-2 text-sm text-text-secondary">
              {active.length === 0
                ? isTeacher
                  ? "Lessons appear here once your availability is booked."
                  : "Your teacher will schedule your next lesson. It will appear here."
                : "Past lessons stay available from their session page."}
            </p>
          }
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-4 lg:order-2">
          {isTeacher ? (
            <PendingReports rows={pendingReports} />
          ) : progress ? (
            <ContinuePanel progress={progress} totalAyahs={totalAyahs} />
          ) : null}
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

function LessonHero({
  session,
  isTeacher,
  today,
}: {
  session: SessionRow;
  isTeacher: boolean;
  today: boolean;
}) {
  const [joinState, setJoinState] = useState<JoinState>(session.joinState);
  const [opensAt, setOpensAt] = useState(session.opensAt);
  const [closesAt, setClosesAt] = useState(session.closesAt);

  const chip = JOIN_CHIP[joinState];

  return (
    <GlassCard grade="lantern" mashrabiya className="p-5 sm:p-6">
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              {today ? "Today's lesson" : "Your next lesson"}
            </p>
            <p className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              <LocalTime iso={session.startTime} mode="time" />
            </p>
            <p className="text-sm text-text-secondary">
              <LocalTime iso={session.startTime} mode="weekday" /> · with{" "}
              <span className="font-semibold text-text-primary">
                {session.otherPartyName}
              </span>
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {session.title ?? sessionTypeLabel(session.sessionType)}
              {session.planLabel ? ` · ${session.planLabel}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
            <StatusChip tone="primary">{sessionTypeLabel(session.sessionType)}</StatusChip>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <LessonJoinCard
            session={{ ...session, joinState, opensAt, closesAt }}
            onJoinStateChange={(update) => {
              setJoinState(update.joinState);
              setOpensAt(update.opensAt);
              setClosesAt(update.closesAt);
            }}
          />
        </div>

        <Link
          href={`/session/${session.id}`}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-[8px] text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {isTeacher ? "Prepare this lesson" : "Lesson details"}
          <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
        </Link>
      </div>
    </GlassCard>
  );
}

function SessionRowCard({
  session,
  cancelling,
  onCancel,
}: {
  session: SessionRow;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const chip = JOIN_CHIP[session.joinState];
  const canCancel = session.status === "SCHEDULED" && session.joinState === "upcoming";

  return (
    <Panel className="flex flex-wrap items-center gap-4 p-4">
      <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-bg-primary px-2 py-2 text-center">
        <LocalTime
          iso={session.startTime}
          mode="weekday"
          className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary"
        />
        <span className="mt-0.5 text-xs font-bold text-text-primary">
          <LocalTime iso={session.startTime} mode="time" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          with {session.otherPartyName}
        </p>
        <p className="truncate text-xs text-text-secondary">
          {session.title ?? sessionTypeLabel(session.sessionType)}
          {session.planLabel ? ` · ${session.planLabel}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
        <Link
          href={`/session/${session.id}`}
          className="inline-flex min-h-11 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          Open
          <ArrowRight aria-hidden className="ms-1.5 size-3.5 rtl:rotate-180" />
        </Link>
        {canCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-danger disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel"}
          </button>
        ) : null}
      </div>
    </Panel>
  );
}

function ContinuePanel({
  progress,
  totalAyahs,
}: {
  progress: ProgressSummary;
  totalAyahs: number;
}) {
  const hasProgress = progress.uniqueAyahs > 0 && progress.lastStop;

  return (
    <Panel className="flex flex-col gap-3 p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        <TrendingUp aria-hidden className="size-3.5" />
        Continue from
      </p>

      {hasProgress && progress.lastStop ? (
        <>
          <p className="text-lg font-semibold text-text-primary">
            {progress.lastStop.surahName} {progress.lastStop.surah}:{progress.lastStop.ayah}
          </p>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-bold tabular-nums text-primary">{progress.percent}%</p>
            <p className="text-xs tabular-nums text-text-secondary">
              {progress.uniqueAyahs.toLocaleString("en-US")} / {totalAyahs.toLocaleString("en-US")}{" "}
              ayahs
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Quran memorised"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            className="h-1.5 overflow-hidden rounded-full bg-bg-hover"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">
            Your teacher records new memorisation after each lesson. This is your last recorded
            stop.
          </p>
          <Link
            href="/mushaf"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Open the Mushaf
            <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-text-secondary">
            Your starting point appears here after your first lesson report.
          </p>
          <p className="text-xs text-text-secondary">
            Nothing is recorded yet, so there is no position to continue from.
          </p>
        </>
      )}
    </Panel>
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
            Nothing waiting. Finished lessons appear here until their report is written.
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

function TipsPanel() {
  return (
    <Panel className="flex flex-col gap-3 p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        <Clock aria-hidden className="size-3.5" />
        A smooth lesson
      </p>
      <ul className="flex flex-col gap-2 text-sm text-text-secondary">
        <li>Join a few minutes early so the room is ready on time.</li>
        <li>If the call does not load, use Chrome or the Google Meet app.</li>
        <li>Find a quiet room and check your microphone first.</li>
      </ul>
    </Panel>
  );
}
