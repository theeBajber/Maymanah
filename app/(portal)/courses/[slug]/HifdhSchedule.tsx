import { Sun, Zap } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStudentSchedule, getTeacherAvailability, getTodayHifdhSlot } from "@/lib/pairing";
import { getCurrentUser } from "@/lib/session";
import { DailySessionButton } from "./DailySessionButton";
import { RescheduleSlotButton } from "./RescheduleSlotButton";
import { ScheduleSectionClient } from "./ScheduleSectionClient";
import { SetAvailabilityForPairing } from "./SetAvailabilityForPairing";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PAST_PREVIEW = 5;

function formatSlotTime(startTime: string): string {
  // The slot is a wall clock on the teacher's schedule, so it is formatted as
  // read rather than shifted into any zone.
  return new Date(`2000-01-01T${startTime}:00Z`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatSessionDate(startTime: Date): string {
  const date = new Date(startTime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === today.toDateString()) return `Today at ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
}

/**
 * The Hifdh schedule panel on the course page.
 *
 * A student without a pairing is shown the availability grid; once paired they
 * see the weekly slots, today's session, how to move or change them, who they
 * are paired with, and the sessions already behind them.
 */
export async function HifdhSchedule({
  enrolled,
  isTest,
  slug,
  showAll,
}: {
  enrolled: boolean;
  isTest: boolean;
  slug: string;
  showAll: boolean;
}) {
  if (!enrolled) return null;

  const user = await getCurrentUser(await auth());
  if (!user) return null;

  const schedule = await getStudentSchedule(user.id);
  if (!schedule || schedule.slots.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SetAvailabilityForPairing />
      </section>
    );
  }

  const now = new Date();
  const [todaySlot, teacherAvail, notifications, appointments] = await Promise.all([
    getTodayHifdhSlot(user.id),
    getTeacherAvailability(schedule.teacherId),
    db.notification.findMany({
      where: { userId: user.id, type: "session_rescheduled", isRead: false },
      select: { id: true, body: true },
      orderBy: { createdAt: "desc" },
    }),
    db.appointment.findMany({
      where: { mentorshipId: schedule.mentorshipId },
      select: { id: true, title: true, startTime: true, status: true, sessionType: true },
      orderBy: { startTime: "desc" },
    }),
  ]);

  const upcoming = appointments.filter((appointment) => appointment.startTime >= now && appointment.status === "SCHEDULED");
  const nextByType = new Map<string, Date>();
  for (const appointment of [...upcoming].reverse()) {
    if (!nextByType.has(appointment.sessionType)) nextByType.set(appointment.sessionType, appointment.startTime);
  }

  const past = appointments.filter(
    (appointment) => appointment.status === "COMPLETED" || appointment.startTime <= now,
  );
  const pastSessions = showAll ? past : past.slice(0, PAST_PREVIEW);

  return (
    <section className="space-y-6">
      {(todaySlot || isTest) && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-bg-elevated p-6 shadow-raise">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
                <Sun className="size-4" />
                Today&apos;s Daily Session
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {todaySlot
                  ? todaySlot.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                  : "Test Mode"}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {todaySlot ? `${todaySlot.duration} min session` : "Force-start a session for testing"}
              </p>
            </div>
            <DailySessionButton
              startTime={todaySlot ? todaySlot.startTime.toISOString() : ""}
              endTime={todaySlot ? todaySlot.endTime.toISOString() : ""}
              isTest={!todaySlot && isTest}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-raise">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Your Schedule</h3>
        <div className="space-y-3">
          {schedule.slots.map((slot) => {
            const SlotIcon = slot.type === "DAILY_HIFDH" ? Sun : Zap;
            const next = nextByType.get(slot.type);
            return (
              <div key={`${slot.type}-${slot.dayOfWeek}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-[10px] border border-primary/25 text-primary">
                    <SlotIcon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {slot.type === "DAILY_HIFDH" ? "Daily Hifdh" : "Muraja'ah"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {DAY_NAMES[slot.dayOfWeek]}s at {formatSlotTime(slot.startTime)} &middot; {slot.duration} min
                    </p>
                  </div>
                </div>
                {next && <RescheduleSlotButton teacherId={schedule.teacherId} teacherTimeZone={schedule.teacherTimeZone} sessionType={slot.type} nextOccurrence={next.toISOString()} />}
              </div>
            );
          })}
        </div>
        <p className="mt-3 border-t border-border pt-3 text-xs text-text-muted">Teacher: {schedule.teacherName}</p>
        <ScheduleSectionClient
          mentorshipId={schedule.mentorshipId}
          teacherAvail={teacherAvail}
          mismatchNotifications={notifications}
        />
      </div>

      {pastSessions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
              <span className="size-2 rounded-full bg-text-muted" />
              Past Sessions
              <span className="text-xs font-normal normal-case tracking-normal text-text-muted">
                ({pastSessions.length}
                {past.length > pastSessions.length ? ` of ${past.length}` : ""})
              </span>
            </h3>
            {past.length > pastSessions.length && (
              <Link
                href={`/courses/${slug}?show=all`}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-light"
              >
                View all {past.length} sessions →
              </Link>
            )}
            {showAll && past.length > PAST_PREVIEW && (
              <Link
                href={`/courses/${slug}`}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-light"
              >
                ← Show latest
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {pastSessions.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-bg-elevated/50 p-4 opacity-70"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-bg-hover">
                  <Sun className="size-4 text-text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-text-primary">
                    {appointment.title || "Session"}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">
                    {formatSessionDate(appointment.startTime)} — with {schedule.teacherName}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {appointment.status === "COMPLETED" ? "Completed" : "Missed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!todaySlot && pastSessions.length === 0 && (
        <EmptyState title="Sessions will appear here once your teacher schedules them." />
      )}
    </section>
  );
}
