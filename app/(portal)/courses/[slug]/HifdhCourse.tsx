import { GlassCard } from "@/app/ui/glass";
import type { SessionRow } from "@/app/ui/session-cards";
import { getSessionSchedule } from "@/lib/agenda";
import { auth } from "@/lib/auth";
import type { CourseDetail } from "@/lib/courses";
import { db } from "@/lib/db";
import { planRangeLabel } from "@/lib/live-session";
import { getStudentSchedule, getTeacherAvailability, getTodayHifdhSlot } from "@/lib/pairing";
import { SURAHS, TOTAL_QURAN_AYAHS } from "@/lib/quran-meta";
import { memorizationProgress } from "@/lib/quran-progress";
import { getCurrentUser } from "@/lib/session";
import { CourseIdentity } from "./CourseIdentity";
import {
  HifdhCourseView,
  type PastSession,
  type WeeklySlot,
} from "./HifdhCourseView";

const PAST_PREVIEW = 5;

/**
 * The shape of the page while its live data loads.
 *
 * It carries the real course identity, so the hero's name and description are
 * painted in the first streamed frame rather than waiting on the pairing.
 */
export function HifdhCourseLoading({ course }: { course: CourseDetail }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <GlassCard grade="lantern" mashrabiya className="p-5 sm:p-6">
        <div className="relative flex flex-col gap-6">
          <CourseIdentity course={course} />

          <div className="border-t border-border pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              Today&apos;s lesson
            </p>
            <div className="mt-3 h-10 w-32 rounded-lg bg-bg-hover motion-safe:animate-pulse" />
            <div className="mt-3 h-4 w-56 max-w-full rounded bg-bg-hover motion-safe:animate-pulse" />
            <div className="mt-5 h-11 w-44 max-w-full rounded-[10px] bg-bg-hover motion-safe:animate-pulse" />
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="h-40 rounded-2xl border border-border bg-bg-elevated motion-safe:animate-pulse lg:order-2" />
        <div className="h-56 rounded-2xl border border-border bg-bg-elevated motion-safe:animate-pulse lg:order-1" />
      </div>

      <span className="sr-only" role="status">
        Loading today&apos;s lesson and your progress.
      </span>
    </div>
  );
}

function formatSlotTime(startTime: string): string {
  // The slot is a wall clock on the teacher's schedule, so it is formatted as
  // read rather than shifted into any zone.
  return new Date(`2000-01-01T${startTime}:00Z`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/**
 * The enrolled student's Hifdh page.
 *
 * Reads the pairing, the schedule, and progress together so the hero, the
 * coming-up list, and the weekly timetable all agree. The join state on every
 * row is computed here; the browser only renders it.
 */
export async function HifdhCourse({
  course,
  isTest,
  showAll,
}: {
  course: CourseDetail;
  isTest: boolean;
  showAll: boolean;
}) {
  const user = await getCurrentUser(await auth());
  if (!user) return null;

  const [schedule, progress] = await Promise.all([
    getStudentSchedule(user.id),
    memorizationProgress(user.id),
  ]);

  const progressSummary = {
    rangeCount: progress.rangeCount,
    uniqueAyahs: progress.uniqueAyahs,
    percent: progress.percent,
    lastStop: progress.lastStop,
  };

  if (!schedule || schedule.slots.length === 0) {
    return (
      <HifdhCourseView
        identity={<CourseIdentity course={course} />}
        isTest={isTest}
        totalAyahs={TOTAL_QURAN_AYAHS}
        sessions={[]}
        progress={progressSummary}
        teacherName={null}
        todaySlot={null}
        pastSessions={[]}
        pastTotal={0}
        showAll={showAll}
        schedule={null}
        teacherAvail={[]}
        mismatchNotifications={[]}
      />
    );
  }

  const [sessionSchedule, todaySlot, teacherAvail, notifications, appointments] =
    await Promise.all([
      getSessionSchedule(user.id, 90, schedule.mentorshipId),
      getTodayHifdhSlot(user.id),
      getTeacherAvailability(schedule.teacherId),
      db.notification.findMany({
        where: { userId: user.id, type: "session_rescheduled", isRead: false },
        select: { id: true, body: true },
        orderBy: { createdAt: "desc" },
      }),
      db.appointment.findMany({
        where: { mentorshipId: schedule.mentorshipId },
        select: { id: true, title: true, startTime: true, status: true },
        orderBy: { startTime: "desc" },
      }),
    ]);

  const now = new Date();
  const nextByType = new Map<string, string>();
  for (const session of sessionSchedule) {
    if (session.joinState !== "upcoming" && session.joinState !== "open") continue;
    // An open room may already have started. "Reschedule this week" needs the
    // next occurrence that can still be booked, never a time in the past.
    if (session.startTime.getTime() <= now.getTime()) continue;
    if (!nextByType.has(session.sessionType)) {
      nextByType.set(session.sessionType, session.startTime.toISOString());
    }
  }

  const slots: WeeklySlot[] = schedule.slots.map((slot) => ({
    ...slot,
    timeLabel: formatSlotTime(slot.startTime),
    nextOccurrence: nextByType.get(slot.type) ?? null,
  }));

  const sessions: SessionRow[] = sessionSchedule.map((session) => ({
    id: session.id,
    title: session.title,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime?.toISOString() ?? null,
    status: session.status,
    sessionType: session.sessionType,
    isTeacher: false,
    otherPartyName: session.otherPartyName,
    planLabel: session.plan ? planRangeLabel(session.plan, SURAHS) : null,
    joinState: session.joinState,
    opensAt: session.opensAt.toISOString(),
    closesAt: session.closesAt.toISOString(),
  }));

  const pastAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "CANCELLED" &&
      (appointment.status === "COMPLETED" || appointment.startTime <= now),
  );
  const pastSessions: PastSession[] = (
    showAll ? pastAppointments : pastAppointments.slice(0, PAST_PREVIEW)
  ).map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    startTime: appointment.startTime.toISOString(),
    status: appointment.status,
  }));

  return (
    <HifdhCourseView
      identity={<CourseIdentity course={course} />}
      isTest={isTest}
      totalAyahs={TOTAL_QURAN_AYAHS}
      sessions={sessions}
      progress={progressSummary}
      teacherName={schedule.teacherName}
      todaySlot={
        todaySlot
          ? {
              startTime: todaySlot.startTime.toISOString(),
              endTime: todaySlot.endTime.toISOString(),
              duration: todaySlot.duration,
            }
          : null
      }
      pastSessions={pastSessions}
      pastTotal={pastAppointments.length}
      showAll={showAll}
      schedule={{
        mentorshipId: schedule.mentorshipId,
        teacherId: schedule.teacherId,
        teacherTimeZone: schedule.teacherTimeZone,
        slots,
      }}
      teacherAvail={teacherAvail}
      mismatchNotifications={notifications}
    />
  );
}
