"use client";

import { ArrowRight, Loader2, Sun, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { GlassCard } from "@/app/ui/glass";
import { LocalTime } from "@/app/ui/LocalTime";
import { EmptyState, Panel } from "@/app/ui/portal";
import {
  ProgressPanel,
  SessionRowCard,
  TipsPanel,
  TodayLessonCard,
  type ProgressSummary,
  type SessionRow,
} from "@/app/ui/session-cards";
import { useToast } from "@/app/ui/toast";
import { localDayKey, pickFeaturedSession } from "@/lib/live-session";
import { RescheduleSlotButton } from "./RescheduleSlotButton";
import { ScheduleSectionClient } from "./ScheduleSectionClient";
import { SetAvailabilityForPairing } from "./SetAvailabilityForPairing";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface WeeklySlot {
  type: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
  /** A readable 12-hour label; the slot is wall-clock on the teacher's schedule. */
  timeLabel: string;
  nextOccurrence: string | null;
}

export interface PastSession {
  id: string;
  title: string | null;
  startTime: string;
  status: string;
}

export interface HifdhCourseViewProps {
  identity: ReactNode;
  isTest: boolean;
  totalAyahs: number;
  sessions: SessionRow[];
  progress: ProgressSummary | null;
  teacherName: string | null;
  todaySlot: { startTime: string; endTime: string; duration: number } | null;
  pastSessions: PastSession[];
  pastTotal: number;
  showAll: boolean;
  schedule: {
    mentorshipId: string;
    teacherId: string;
    teacherTimeZone: string;
    slots: WeeklySlot[];
  } | null;
  teacherAvail: { dayOfWeek: number; startTime: string; endTime: string }[];
  mismatchNotifications: { id: string; body: string | null }[];
}

/**
 * The student's Hifdh course page: course identity, next lesson, and progress.
 *
 * The join window always arrives computed on the server. The browser only
 * resolves which calendar day is "today" after mount, so a lesson near midnight
 * is not filed under the wrong date, and the join button never trusts the
 * client clock.
 */
export function HifdhCourseView({
  identity,
  isTest,
  totalAyahs,
  sessions,
  progress,
  teacherName,
  todaySlot,
  pastSessions,
  pastTotal,
  showAll,
  schedule,
  teacherAvail,
  mismatchNotifications,
}: HifdhCourseViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    // The browser's calendar day is only known after mount.
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
  const hasTodaySession = todayKey
    ? today.length > 0
    : Boolean(todaySlot && active.some((session) => session.startTime === todaySlot.startTime));

  const canStartToday = Boolean(schedule && (isTest || (todaySlot && !hasTodaySession)));
  const featured = canStartToday ? null : hero;
  const featuredIsToday = Boolean(
    featured && today.some((session) => session.id === featured.id),
  );

  const upcoming = active.filter(
    (session) =>
      session.id !== featured?.id &&
      (session.joinState === "upcoming" || session.joinState === "open"),
  );

  const past = pastSessions.filter((session) => session.id !== featured?.id);

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

  async function startToday() {
    setStarting(true);
    try {
      const query = isTest ? "?test=1" : "";
      const response = await fetch(`/api/appointments/daily${query}`, { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as { id?: string; error?: string };

      if (!response.ok || !body.id) {
        toast({
          title: body.error ?? "Could not start today's session",
          variant: "error",
        });
        return;
      }

      router.push(`/session/${body.id}${isTest ? "?test=1" : ""}`);
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassCard grade="lantern" mashrabiya className="p-5 sm:p-6">
        <div className="relative flex flex-col gap-6">
          {identity}

          <div className="border-t border-border pt-5">
            {canStartToday ? (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Today&apos;s lesson
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                    {todaySlot ? (
                      <LocalTime iso={todaySlot.startTime} mode="time" />
                    ) : (
                      "Test mode"
                    )}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {todaySlot
                      ? `${todaySlot.duration} min session · with ${teacherName ?? "your teacher"}`
                      : "Force-start a session without waiting for the clock."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startToday}
                  disabled={starting}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-primary px-6 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {starting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
                  {starting
                    ? "Starting…"
                    : isTest
                      ? "Force Start session"
                      : "Start today's session"}
                </button>
              </div>
            ) : featured ? (
              <TodayLessonCard
                session={featured}
                isTeacher={false}
                today={featuredIsToday}
              />
            ) : schedule ? (
              <EmptyState
                title={
                  active.length === 0
                    ? "No lessons booked yet."
                    : "No upcoming lessons right now."
                }
                action={
                  <p className="mt-2 text-sm text-text-secondary">
                    {active.length === 0
                      ? "Your teacher will schedule your next lesson. It will appear here."
                      : "Past lessons stay available below."}
                  </p>
                }
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Today&apos;s lesson
                </p>
                <p className="text-sm text-text-secondary">
                  You are not paired with a teacher yet. Choose your weekly availability below and
                  we will match you.
                </p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-5 lg:order-2">
          {progress ? <ProgressPanel progress={progress} totalAyahs={totalAyahs} /> : null}
          <TipsPanel />
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:order-1">
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

          {past.length > 0 ? (
            <section className="flex flex-col gap-3" aria-labelledby="past-lessons">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2
                  id="past-lessons"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
                >
                  Past lessons
                  <span className="ms-2 font-normal normal-case tracking-normal text-text-secondary">
                    ({past.length}
                    {pastTotal > past.length ? ` of ${pastTotal}` : ""})
                  </span>
                </h2>
                {pastTotal > pastSessions.length ? (
                  <Link
                    href={`/courses/hifdh-ul-quran?show=all`}
                    className="inline-flex min-h-11 items-center text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    View all {pastTotal} lessons
                    <ArrowRight aria-hidden className="ms-1 size-3.5 rtl:rotate-180" />
                  </Link>
                ) : showAll && pastTotal > 5 ? (
                  <Link
                    href="/courses/hifdh-ul-quran"
                    className="inline-flex min-h-11 items-center text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Show latest
                  </Link>
                ) : null}
              </div>

              <ul className="flex flex-col gap-2">
                {past.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={`/session/${session.id}`}
                      className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-bg-elevated/60 p-3 transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-bg-hover text-text-secondary">
                        <Sun aria-hidden className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-text-primary">
                          {session.title ?? "Lesson"}
                        </span>
                        <span className="block text-xs text-text-secondary">
                          <LocalTime iso={session.startTime} mode="date-short" />
                          {teacherName ? ` · with ${teacherName}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        {session.status === "COMPLETED" ? "Completed" : "Missed"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {schedule ? (
        <Panel className="flex flex-col gap-3 p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Weekly schedule
          </h2>

          <ul className="flex flex-col gap-3">
            {schedule.slots.map((slot) => {
              const SlotIcon = slot.type === "DAILY_HIFDH" ? Sun : Zap;
              return (
                <li
                  key={`${slot.type}-${slot.dayOfWeek}`}
                  className="flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-[10px] border border-primary/25 text-primary">
                      <SlotIcon aria-hidden className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {slot.type === "DAILY_HIFDH" ? "Daily Hifdh" : "Muraja'ah"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {DAY_NAMES[slot.dayOfWeek]}s at {slot.timeLabel} · {slot.duration} min
                      </p>
                    </div>
                  </div>
                  {slot.nextOccurrence ? (
                    <RescheduleSlotButton
                      teacherId={schedule.teacherId}
                      teacherTimeZone={schedule.teacherTimeZone}
                      sessionType={slot.type}
                      nextOccurrence={slot.nextOccurrence}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>

          <p className="border-t border-border pt-3 text-xs text-text-secondary">
            Teacher: {teacherName ?? "your teacher"}
          </p>
          <ScheduleSectionClient
            mentorshipId={schedule.mentorshipId}
            teacherAvail={teacherAvail}
            mismatchNotifications={mismatchNotifications}
          />
        </Panel>
      ) : (
        <SetAvailabilityForPairing />
      )}
    </div>
  );
}
