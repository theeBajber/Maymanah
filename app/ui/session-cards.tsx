"use client";

import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LessonJoinCard } from "@/app/ui/LessonJoinCard";
import { LocalTime } from "@/app/ui/LocalTime";
import { StatusChip, type StatusTone } from "@/app/ui/chips";
import { amiri } from "@/app/ui/fonts";
import { Panel } from "@/app/ui/portal";
import { sessionTypeLabel, type JoinState } from "@/lib/live-session";
import { surahArabicName } from "@/lib/surah-arabic";

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
            {today ? "Today's session" : "Your next session"}
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
          {isTeacher ? "Prepare this session" : "Session details"}
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

export function ContinueFromCard({
  progress,
  totalAyahs,
  targetLabel,
}: {
  progress: ProgressSummary;
  totalAyahs: number;
  /** The next lesson's planned range, when the teacher has set one. */
  targetLabel?: string | null;
}) {
  const hasProgress = progress.uniqueAyahs > 0 && progress.lastStop;

  return (
    <Panel className="flex h-full flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        <TrendingUp aria-hidden className="size-3.5" />
        Continue from
      </h2>

      {hasProgress && progress.lastStop ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="text-balance text-2xl font-bold tracking-tight text-text-primary">
                {progress.lastStop.surahName}
              </p>
              <p className="mt-0.5 text-sm tabular-nums text-text-secondary">
                Surah {progress.lastStop.surah} · Ayah {progress.lastStop.ayah}
              </p>
            </div>
            <p
              lang="ar"
              dir="rtl"
              className={`${amiri.className} shrink-0 text-3xl leading-snug text-text-primary`}
            >
              {surahArabicName(progress.lastStop.surah)}
            </p>
          </div>

          {targetLabel ? (
            <div className="rounded-xl bg-bg-hover/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                Today&apos;s target
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">{targetLabel}</p>
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-2">
            <div
              role="progressbar"
              aria-label="Quran memorised"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percent}
              className="h-2 overflow-hidden rounded-full bg-bg-hover"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-xs tabular-nums text-text-secondary">
              {progress.uniqueAyahs.toLocaleString("en-US")} of{" "}
              {totalAyahs.toLocaleString("en-US")} ayahs memorised · {progress.percent}%
            </p>
          </div>

          <Link
            href="/mushaf"
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-[8px] text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Open the Mushaf
            <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div
              role="img"
              aria-label={`${progress.percent}% of the Quran memorised`}
              className="relative flex size-16 shrink-0 items-center justify-center"
            >
              <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress.percent / 100) * 2 * Math.PI * 27} ${2 * Math.PI * 27}`}
                />
              </svg>
              <span className="absolute text-sm font-bold tabular-nums text-text-primary">
                {progress.percent}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-text-primary">
                Your journey starts here
              </p>
              <p className="mt-0.5 text-sm tabular-nums text-text-secondary">
                0 of {totalAyahs.toLocaleString("en-US")} ayahs
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-text-secondary">
            Your teacher sets your starting point after your first session report. Until then there
            is no position to continue from.
          </p>
        </>
      )}
    </Panel>
  );
}

export function TipsPanel() {
  const tips = [
    "Join a few minutes early so the room is ready on time.",
    "If the call doesn't load, use Chrome or the Google Meet app.",
    "Find a quiet room and check your microphone first.",
  ];

  return (
    <Panel className="p-4">
      <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        <Clock aria-hidden className="size-3.5" />
        A smooth session
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm leading-snug text-text-secondary">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            {tip}
          </li>
        ))}
      </ul>
    </Panel>
  );
}


