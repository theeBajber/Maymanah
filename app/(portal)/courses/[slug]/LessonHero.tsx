"use client";

import { Loader2, UserRound } from "lucide-react";

import { LessonJoinCard } from "@/app/ui/LessonJoinCard";
import { LocalTime } from "@/app/ui/LocalTime";
import { Panel } from "@/app/ui/portal";
import type { SessionRow } from "@/app/ui/session-cards";

function initials(name: string | null): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || null;
}

function durationMinutes(session: SessionRow): number | null {
  if (!session.endTime) return null;
  const minutes = Math.round(
    (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60_000,
  );
  return minutes > 0 ? minutes : null;
}

/**
 * Today's session, or the next one when today has none.
 *
 * The join button and its states come from the server-computed session row;
 * this component only arranges them. The teacher's real portrait is shown when
 * they have one, with their initials as the fallback.
 */
export function LessonHero({
  session,
  isToday,
  laterToday,
  teacherName,
  teacherImage,
  isTest,
  todaySlot,
  starting,
  canStartToday,
  unpaired = false,
  onStartToday,
}: {
  session: SessionRow | null;
  isToday: boolean;
  laterToday: number;
  teacherName: string | null;
  teacherImage: string | null;
  isTest: boolean;
  todaySlot: { startTime: string; endTime: string; duration: number } | null;
  starting: boolean;
  canStartToday: boolean;
  unpaired?: boolean;
  onStartToday: () => void;
}) {
  const teacherInitials = initials(teacherName);
  const minutes = session ? durationMinutes(session) : null;

  return (
    <Panel className="flex h-full flex-col gap-5 p-5 sm:p-6">
      {canStartToday ? (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Today&apos;s session
          </p>
          <p className="text-[clamp(2.5rem,7vw,3.75rem)] font-bold leading-none tracking-tight text-text-primary">
            {todaySlot ? <LocalTime iso={todaySlot.startTime} mode="time" /> : "Test mode"}
          </p>
          <p className="text-sm text-text-secondary">
            {todaySlot
              ? `${todaySlot.duration} min session · with ${teacherName ?? "your teacher"}`
              : "Force-start a session without waiting for the clock."}
          </p>
          <button
            type="button"
            onClick={onStartToday}
            disabled={starting}
            className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-6 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 sm:w-auto"
          >
            {starting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {starting ? "Starting…" : isTest ? "Force Start session" : "Start today's session"}
          </button>
        </>
      ) : session ? (
        <>
          <div>
            {!isToday ? (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Next session
              </p>
            ) : null}
            <p className="text-[clamp(2.75rem,8vw,3.75rem)] font-bold leading-none tracking-tight text-text-primary">
              <LocalTime iso={session.startTime} mode="time" />
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              <LocalTime iso={session.startTime} mode={isToday ? "weekday" : "date-short"} />
              {minutes ? <span> · {minutes} min</span> : null}
              {session.title ? <span> · {session.title}</span> : null}
            </p>
          </div>

          {laterToday > 0 ? (
            <p className="-mt-2 text-xs font-medium text-text-secondary">
              +{laterToday} later today
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            {teacherImage ? (
              // Profile images can be uploaded or come from an OAuth provider,
              // so a plain image avoids an allowlist of every possible host.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacherImage}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-bold text-primary"
              >
                {teacherInitials ?? <UserRound className="size-4" />}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                {session.otherPartyName || teacherName || "Your teacher"}
              </p>
              <p className="text-xs text-text-secondary">Your teacher</p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
            <LessonJoinCard session={session} showUpcomingHint={false} />
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Your next session
          </p>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {unpaired ? "You are not paired yet." : "No sessions booked yet."}
          </p>
          <p className="text-sm leading-relaxed text-text-secondary">
            {unpaired
              ? "Choose your weekly availability below and we will match you with a teacher."
              : "Your teacher will schedule your next session. It will appear here, along with the room when it opens."}
          </p>
        </>
      )}
    </Panel>
  );
}
