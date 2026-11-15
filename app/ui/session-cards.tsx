"use client";

import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LessonJoinCard } from "@/app/ui/LessonJoinCard";
import { LocalTime } from "@/app/ui/LocalTime";
import { StatusChip, type StatusTone } from "@/app/ui/chips";
import { Panel } from "@/app/ui/portal";
import { sessionTypeLabel, type JoinState } from "@/lib/live-session";

export interface SessionRow {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  sessionType: string;
  isTeacher: boolean;
  otherPartyName: string;
  planLabel: string | null;
  joinState: JoinState;
  opensAt: string;
  closesAt: string;
}

export interface ProgressSummary {
  rangeCount: number;
  uniqueAyahs: number;
  percent: number;
  lastStop: { surah: number; ayah: number; surahName: string } | null;
}

export interface PendingReportRow {
  id: string;
  title: string | null;
  startTime: string;
  sessionType: string;
  studentName: string;
}

export const JOIN_CHIP: Record<JoinState, { label: string; tone: StatusTone }> = {
  open: { label: "Room open", tone: "success" },
  upcoming: { label: "Upcoming", tone: "info" },
  ended: { label: "Ended", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

/**
 * The lesson the screen leads with, without its own surface.
 *
 * Shared by the teacher's schedule and the Hifdh course page so the join
 * window, time display, and wording stay identical on both. The parent decides
 * whether that surface is a lantern hero (course) or a glass card (sessions).
 */
export function TodayLessonCard({
  session,
  isTeacher,
  today = false,
  showDetailsLink = true,
}: {
  session: SessionRow;
  isTeacher: boolean;
  /** Resolved by the parent after mount; the server cannot know the viewer's day. */
  today?: boolean;
  showDetailsLink?: boolean;
}) {
  const [joinState, setJoinState] = useState(session.joinState);
  const [opensAt, setOpensAt] = useState(session.opensAt);
  const [closesAt, setClosesAt] = useState(session.closesAt);

  const chip = JOIN_CHIP[joinState];

  return (
    <div className="flex flex-col gap-5">
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

      {showDetailsLink ? (
        <Link
          href={`/session/${session.id}`}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-[8px] text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {isTeacher ? "Prepare this lesson" : "Lesson details"}
          <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
        </Link>
      ) : null}
    </div>
  );
}

export function SessionRowCard({
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

export function ProgressPanel({
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

export function TipsPanel() {
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


