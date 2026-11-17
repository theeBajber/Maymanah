"use client";

import { ArrowRight, ChevronDown, Clock, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";

import { LocalTime } from "@/app/ui/LocalTime";
import { RescheduleDialog } from "@/app/ui/RescheduleDialog";
import { Panel } from "@/app/ui/portal";
import { sessionTypeLabel, type JoinState, type LessonStatusKey } from "@/lib/live-session";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScheduleSectionClient } from "./ScheduleSectionClient";

export interface WeekSession {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string | null;
  sessionType: string;
  joinState: JoinState;
  opensAt: string;
  closesAt: string;
  statusKey: LessonStatusKey;
  beforeYouJoined: boolean;
}

export interface WeekSchedule {
  mentorshipId: string;
  teacherId: string;
  teacherTimeZone: string;
}

const HISTORY_STATUSES: LessonStatusKey[] = [
  "before",
  "completed",
  "missed",
  "cancelled",
  "not-joined",
  "ended",
];

const STATUS_CLASS: Record<LessonStatusKey, string> = {
  before: "text-text-secondary",
  completed: "text-success",
  missed: "text-warning-strong",
  cancelled: "text-danger",
  "not-joined": "text-text-secondary",
  open: "text-primary",
  upcoming: "text-text-secondary",
  ended: "text-text-secondary",
};

function statusText(
  session: WeekSession,
  isToday: boolean,
  formatTime: (iso: string) => string,
): string {
  switch (session.statusKey) {
    case "before":
      return "Before you joined";
    case "completed":
      return "Completed";
    case "missed":
      return "Missed";
    case "cancelled":
      return "Cancelled";
    case "not-joined":
      return "Not joined";
    case "open":
      return "In progress";
    case "upcoming":
      return isToday ? `Opens at ${formatTime(session.opensAt)}` : "Upcoming";
    case "ended":
      return "Session ended";
  }
}

function StatusText({
  session,
  isToday,
  formatTime,
  className = "",
}: {
  session: WeekSession;
  isToday: boolean;
  formatTime: (iso: string) => string;
  className?: string;
}) {
  if (session.statusKey === "upcoming" && isToday) {
    return (
      <span className={`font-semibold ${STATUS_CLASS.upcoming} ${className}`}>
        Opens at <LocalTime iso={session.opensAt} mode="time" />
      </span>
    );
  }

  return (
    <span className={`font-semibold ${STATUS_CLASS[session.statusKey]} ${className}`}>
      {statusText(session, isToday, formatTime)}
    </span>
  );
}

interface Day {
  key: string;
  date: Date;
  weekday: string;
  label: string;
  isToday: boolean;
}

function weekDays(todayKey: string | null): Day[] {
  if (!todayKey) return [];

  const now = new Date();
  return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      label: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      isToday: offset === 0,
    };
  });
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * The seven days around today, with each session's real state and actions.
 *
 * Back days come from the same appointment rows as history, so a missed or
 * cancelled session cannot disappear from the week just because the cron has
 * rewritten its status. "Before you joined" is the honest label for a row that
 * predates the pairing or enrolment.
 *
 * Every row in a day's popover is one link, so a past session is as easy to
 * open as a future one; only a session that can still be moved carries the
 * reschedule and cancel controls, which sit beneath the link rather than
 * inside it.
 */
export function WeekStrip({
  sessions,
  todayKey,
  schedule,
  teacherAvail,
  mismatchNotifications,
  defaultShowHistory,
  cancellingId,
  onCancel,
}: {
  sessions: WeekSession[];
  todayKey: string | null;
  schedule: WeekSchedule | null;
  teacherAvail: { dayOfWeek: number; startTime: string; endTime: string }[];
  mismatchNotifications: { id: string; body: string | null }[];
  defaultShowHistory: boolean;
  cancellingId: string | null;
  onCancel: (id: string) => Promise<boolean>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<WeekSession | null>(null);
  const [reschedule, setReschedule] = useState<WeekSession | null>(null);
  const [showHistory, setShowHistory] = useState(defaultShowHistory);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const days = useMemo(() => weekDays(todayKey), [todayKey]);

  useEffect(() => {
    // On a phone the strip scrolls; today must be in view without hunting.
    const strip = stripRef.current;
    if (!strip) return;
    const cell = strip.querySelector<HTMLElement>('[data-today="true"]');
    if (!cell) return;
    const frame = requestAnimationFrame(() => {
      strip.scrollLeft = cell.offsetLeft - (strip.clientWidth - cell.clientWidth) / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [days.length]);
  const byDay = useMemo(() => {
    const groups = new Map<string, WeekSession[]>();
    for (const session of sessions) {
      const key = localDayKey(new Date(session.startTime));
      const list = groups.get(key);
      if (list) list.push(session);
      else groups.set(key, [session]);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => {
        // Today's cell leads with the session still to come, so a completed
        // session earlier in the day does not hide the one the button opens.
        const rank = (session: WeekSession) =>
          session.statusKey === "open"
            ? 0
            : session.statusKey === "upcoming"
              ? 1
              : session.statusKey === "ended"
                ? 2
                : 3;
        return (
          rank(a) - rank(b) ||
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      });
    }
    return groups;
  }, [sessions]);

  const history = useMemo(
    () =>
      sessions
        .filter((session) => HISTORY_STATUSES.includes(session.statusKey))
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [sessions],
  );

  const selectedDay = days.find((day) => day.key === selected) ?? null;
  const selectedSessions = selectedDay ? (byDay.get(selectedDay.key) ?? []) : [];

  function closePanel() {
    const key = selected;
    setSelected(null);
    if (key) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-day="${key}"]`)?.focus();
      });
    }
  }

  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="this-week" className="text-lg font-bold text-text-primary">
          This week
        </h2>
        <button
          type="button"
          aria-expanded={showHistory}
          aria-controls="past-sessions"
          onClick={() => setShowHistory((value) => !value)}
          className="inline-flex min-h-11 items-center gap-1 rounded-[8px] text-xs font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          All past sessions
          <span aria-hidden className="font-normal text-text-secondary">
            ({history.length})
          </span>
          <ChevronDown
            aria-hidden
            className={`size-3.5 transition-transform motion-reduce:transition-none ${showHistory ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {days.length === 0 ? (
        <div className="flex flex-col gap-2" aria-hidden>
          <div className="grid gap-2 sm:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="h-28 rounded-xl border border-border bg-bg-hover/40 motion-safe:animate-pulse"
              />
            ))}
          </div>
          <span className="sr-only" role="status">
            Loading this week&apos;s sessions.
          </span>
        </div>
      ) : (
        <div
          ref={stripRef}
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0"
        >
          {days.map((day, index) => {
            const daySessions = byDay.get(day.key) ?? [];
            const primary = daySessions[0] ?? null;
            const extra = daySessions.length - 1;
            const cellStatus = primary
              ? statusText(primary, day.isToday, formatTime)
              : "No session";
            const aria = `${day.label}, ${primary ? `${formatTime(primary.startTime)}, ${cellStatus}` : "no session"}${
              extra > 0 ? `, ${extra} more` : ""
            }`;

            return (
              <div
                key={day.key}
                data-today={day.isToday ? "true" : undefined}
                className="relative min-w-[5.25rem] snap-start sm:min-w-0"
              >
                <button
                  type="button"
                  data-day={day.key}
                  aria-label={aria}
                  aria-current={day.isToday ? "date" : undefined}
                  aria-expanded={selected === day.key}
                  aria-controls={selected === day.key ? "week-day-panel" : undefined}
                  onClick={() => setSelected(selected === day.key ? null : day.key)}
                  className={`flex min-h-28 w-full flex-col items-start gap-1 rounded-xl border p-2.5 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    day.isToday
                      ? "border-primary/60 bg-primary/5"
                      : "border-border bg-bg-primary/40 hover:bg-bg-hover"
                  } ${selected === day.key ? "ring-2 ring-primary/50" : ""}`}
                >
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    {day.weekday}
                    {day.isToday ? (
                      <span className="rounded-full bg-primary-muted px-1.5 py-0.5 text-[9px] text-primary">
                        Today
                      </span>
                    ) : null}
                  </span>
                  <span className="text-lg font-bold leading-none tabular-nums text-text-primary">
                    {day.date.getDate()}
                    <span className="ms-1 text-[10px] font-medium uppercase text-text-secondary">
                      {day.date.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </span>
                  <span className="mt-1 text-[11px] tabular-nums text-text-secondary">
                    {primary ? <LocalTime iso={primary.startTime} mode="time" /> : "—"}
                  </span>
                  <span className="mt-auto line-clamp-2 text-[11px] leading-tight">
                    {primary ? (
                      <StatusText
                        session={primary}
                        isToday={day.isToday}
                        formatTime={formatTime}
                        className="text-[11px]"
                      />
                    ) : (
                      <span className="text-text-secondary">No session</span>
                    )}
                  </span>
                  {extra > 0 ? (
                    <span className="text-[10px] font-medium text-text-secondary">
                      +{extra} more
                    </span>
                  ) : null}
                </button>

                {selected === day.key ? (
                  <>
                    <div
                      aria-hidden
                      className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
                      onClick={closePanel}
                    />
                    <div
                      id="week-day-panel"
                      role="dialog"
                      aria-label={day.label}
                      className={`fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-bg-elevated p-4 shadow-xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-2 sm:w-80 ${
                        index > 3 ? "sm:end-0" : "sm:start-0"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{day.label}</p>
                          {day.isToday ? (
                            <p className="text-xs text-text-secondary">Today</p>
                          ) : null}
                        </div>
                        <button
                          ref={closeRef}
                          type="button"
                          onClick={closePanel}
                          aria-label="Close"
                          className="flex size-11 items-center justify-center rounded-[8px] text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          <X aria-hidden className="size-4" />
                        </button>
                      </div>

                      {selectedSessions.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-text-secondary">
                          No session on this day.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {selectedSessions.map((session) => {
                            const canMove = session.statusKey === "upcoming" && schedule;
                            return (
                              <li
                                key={session.id}
                                // The raw ISO instant is the test hook for the
                                // timezone journey: it proves the row landed
                                // under the browser's calendar day, not the
                                // server's.
                                data-start={session.startTime}
                                className="overflow-hidden rounded-xl border border-border bg-bg-primary/40"
                              >
                                <Link
                                  href={`/session/${session.id}`}
                                  className="flex flex-col gap-1 p-3 transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                                >
                                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                    <span className="text-sm font-semibold text-text-primary">
                                      <LocalTime iso={session.startTime} mode="time" />
                                      <span className="ms-1.5 font-normal text-text-secondary">
                                        {session.title ?? sessionTypeLabel(session.sessionType)}
                                      </span>
                                    </span>
                                    <StatusText
                                      session={session}
                                      isToday={day.isToday}
                                      formatTime={formatTime}
                                      className="text-[11px]"
                                    />
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                    {session.statusKey === "upcoming" || session.statusKey === "open"
                                      ? "Open session"
                                      : "View session"}
                                    <ArrowRight aria-hidden className="size-3 rtl:rotate-180" />
                                  </span>
                                </Link>
                                {canMove ? (
                                  <div className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReschedule(session);
                                        setSelected(null);
                                      }}
                                      className="inline-flex min-h-11 items-center rounded-[8px] px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                      Reschedule
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmCancel(session)}
                                      className="inline-flex min-h-11 items-center rounded-[8px] px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {schedule ? (
        <div className="border-t border-border pt-3">
          <ScheduleSectionClient
            mentorshipId={schedule.mentorshipId}
            teacherAvail={teacherAvail}
            mismatchNotifications={mismatchNotifications}
          />
        </div>
      ) : null}

      {showHistory ? (
        <section
          id="past-sessions"
          className="border-t border-border pt-4"
          aria-labelledby="past-sessions-heading"
        >
          <h3
            id="past-sessions-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
          >
            Past sessions
          </h3>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-text-secondary">No sessions have passed yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {history.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/session/${session.id}`}
                    className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-bg-primary/40 p-3 transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="flex min-w-20 shrink-0 flex-col">
                      <LocalTime
                        iso={session.startTime}
                        mode="date-short"
                        className="text-[11px] text-text-secondary"
                      />
                      <LocalTime
                        iso={session.startTime}
                        mode="time"
                        className="text-xs font-semibold tabular-nums text-text-primary"
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm text-text-primary">
                        {session.title ?? sessionTypeLabel(session.sessionType)}
                      </span>
                      <StatusText
                        session={session}
                        isToday={false}
                        formatTime={formatTime}
                        className="text-[11px]"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <ConfirmDialog
        open={confirmCancel !== null}
        danger
        loading={confirmCancel !== null && cancellingId === confirmCancel.id}
        title="Cancel this session?"
        description={
          confirmCancel
            ? `The session at ${formatTime(confirmCancel.startTime)} on ${new Date(
                confirmCancel.startTime,
              ).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} will be cancelled. This cannot be undone.`
            : ""
        }
        confirmLabel="Cancel session"
        cancelLabel="Keep session"
        onConfirm={async () => {
          if (!confirmCancel) return;
          const ok = await onCancel(confirmCancel.id);
          if (ok) setConfirmCancel(null);
        }}
        onCancel={() => setConfirmCancel(null)}
      />

      {reschedule && schedule ? (
        <RescheduleDialog
          appointmentId={reschedule.id}
          teacherId={schedule.teacherId}
          teacherTimeZone={schedule.teacherTimeZone}
          currentStartTime={reschedule.startTime}
          sessionType={reschedule.sessionType}
          onClose={() => setReschedule(null)}
        />
      ) : null}

      <p className="flex items-center gap-1.5 text-[11px] text-text-secondary">
        <Clock aria-hidden className="size-3" />
        Times are shown in your local timezone.
      </p>
    </Panel>
  );
}
