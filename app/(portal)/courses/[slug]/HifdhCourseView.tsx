"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Panel } from "@/app/ui/portal";
import {
  ContinueFromCard,
  TipsPanel,
  type ProgressSummary,
  type SessionRow,
} from "@/app/ui/session-cards";
import { useToast } from "@/app/ui/toast";
import { localDayKey, pickFeaturedSession } from "@/lib/live-session";
import { LessonHero } from "./LessonHero";
import { SetAvailabilityForPairing } from "./SetAvailabilityForPairing";
import { WeekStrip, type WeekSession } from "./WeekStrip";

export interface WeeklySlot {
  type: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
  /** A readable 12-hour label; the slot is wall-clock on the teacher's schedule. */
  timeLabel: string;
  /** The slot's next own occurrence, so the footer keeps the weekly hour. */
  slotTime: string | null;
  nextOccurrence: string | null;
}

export interface HifdhCourseViewProps {
  header: ReactNode;
  isTest: boolean;
  totalAyahs: number;
  sessions: SessionRow[];
  weekSessions: WeekSession[];
  progress: ProgressSummary;
  targetLabel?: string | null;
  teacherName: string | null;
  todaySlot: { startTime: string; endTime: string; duration: number } | null;
  defaultShowHistory: boolean;
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
 * The student's Hifdh course page: lesson first, progress beside it, the week
 * beneath.
 *
 * The join window always arrives computed on the server. The browser only
 * resolves which calendar day is "today" after mount, so a lesson near midnight
 * is not filed under the wrong date, and the join button never trusts the
 * client clock.
 */
export function HifdhCourseView({
  header,
  isTest,
  totalAyahs,
  sessions,
  weekSessions,
  progress,
  targetLabel,
  teacherName,
  todaySlot,
  defaultShowHistory,
  schedule,
  teacherAvail,
  mismatchNotifications,
}: HifdhCourseViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
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
  const visibleWeek = useMemo(
    () =>
      weekSessions.map((session) =>
        cancelled.includes(session.id)
          ? { ...session, statusKey: "cancelled" as const, joinState: "cancelled" as const }
          : session,
      ),
    [weekSessions, cancelled],
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
  const todayWeek = useMemo(
    () =>
      todayKey
        ? visibleWeek.filter(
            (session) =>
              session.statusKey !== "before" &&
              localDayKey(new Date(session.startTime)) === todayKey,
          )
        : [],
    [visibleWeek, todayKey],
  );
  // Only a lesson that still starts later today counts. An earlier completed
  // lesson is not something the student is waiting for.
  const laterToday =
    featuredIsToday && featured
      ? todayWeek.filter(
          (session) =>
            new Date(session.startTime).getTime() > new Date(featured.startTime).getTime() &&
            (session.statusKey === "open" || session.statusKey === "upcoming"),
        ).length
      : 0;

  async function cancel(id: string): Promise<boolean> {
    setCancellingId(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        toast({ title: body.error ?? "Could not cancel that lesson", variant: "error" });
        return false;
      }

      setCancelled((current) => [...current, id]);
      toast({ title: "Lesson cancelled", variant: "success" });
      router.refresh();
      return true;
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
      return false;
    } finally {
      setCancellingId(null);
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
      {header}

      <div className="grid items-stretch gap-5 lg:grid-cols-[1.7fr_1fr]">
        <LessonHero
          session={featured}
          isToday={featuredIsToday}
          laterToday={laterToday}
          teacherName={teacherName}
          isTest={isTest}
          todaySlot={todaySlot}
          starting={starting}
          canStartToday={canStartToday}
          unpaired={!schedule}
          onStartToday={startToday}
        />
        <ContinueFromCard
          progress={progress}
          totalAyahs={totalAyahs}
          targetLabel={targetLabel}
        />
      </div>

      {schedule ? (
        <WeekStrip
          sessions={visibleWeek}
          todayKey={todayKey}
          teacherName={teacherName}
          schedule={schedule}
          teacherAvail={teacherAvail}
          mismatchNotifications={mismatchNotifications}
          defaultShowHistory={defaultShowHistory}
          cancellingId={cancellingId}
          onCancel={cancel}
        />
      ) : (
        <Panel className="flex flex-col gap-4 p-5">
          <h2 className="text-lg font-bold text-text-primary">Get matched with a teacher</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Choose the times you are usually free. We will pair you with a teacher who shares them
            and book your daily lessons from there.
          </p>
          <SetAvailabilityForPairing />
        </Panel>
      )}

      <TipsPanel />
    </div>
  );
}
