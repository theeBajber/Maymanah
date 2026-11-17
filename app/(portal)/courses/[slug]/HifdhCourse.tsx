import type { SessionRow } from "@/app/ui/session-cards";
import { getSessionSchedule } from "@/lib/agenda";
import { auth } from "@/lib/auth";
import type { CourseDetail } from "@/lib/courses";
import { db } from "@/lib/db";
import { joinStateFor, lessonStatusKey, planRangeLabel } from "@/lib/live-session";
import { getStudentSchedule, getTeacherAvailability, getTodayHifdhSlot } from "@/lib/pairing";
import { SURAHS, TOTAL_QURAN_AYAHS } from "@/lib/quran-meta";
import { memorizationProgress } from "@/lib/quran-progress";
import { getCurrentUser } from "@/lib/session";
import { CourseHeader } from "./CourseHeader";
import { HifdhCourseView } from "./HifdhCourseView";
import type { WeekSession } from "./WeekStrip";

/**
 * The shape of the page while its live data loads.
 *
 * The real header paints immediately and the frame stays plain: no hero
 * pattern to swap out the moment the live panel arrives.
 */
export function HifdhCourseLoading({ course }: { course: CourseDetail }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <CourseHeader course={course} />

      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
          <div className="relative flex flex-col gap-4">
            <div className="h-6 w-32 rounded-full bg-bg-hover motion-safe:animate-pulse" />
            <div className="h-14 w-44 rounded-lg bg-bg-hover motion-safe:animate-pulse" />
            <div className="h-4 w-64 max-w-full rounded bg-bg-hover motion-safe:animate-pulse" />
            <div className="mt-2 h-10 w-40 rounded-full bg-bg-hover motion-safe:animate-pulse" />
            <div className="h-12 w-full max-w-xs rounded-[10px] bg-bg-hover motion-safe:animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-2xl border border-border bg-bg-elevated motion-safe:animate-pulse" />
      </div>

      <div className="h-52 rounded-2xl border border-border bg-bg-elevated motion-safe:animate-pulse" />

      <span className="sr-only" role="status">
        Loading your sessions and progress.
      </span>
    </div>
  );
}

/**
 * The enrolled student's Hifdh page.
 *
 * The join state on every row is computed here; the browser only renders it.
 * Every appointment for the pairing is read once, so the week strip and the
 * history agree, and a row that predates the current pairing or enrolment is
 * marked before it reaches the client.
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

  const [schedule, progress, enrollment] = await Promise.all([
    getStudentSchedule(user.id),
    memorizationProgress(user.id),
    db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: { enrolledAt: true },
    }),
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
        header={<CourseHeader course={course} />}
        isTest={isTest}
        totalAyahs={TOTAL_QURAN_AYAHS}
        sessions={[]}
        weekSessions={[]}
        progress={progressSummary}
        teacherName={null}
        teacherImage={null}
        todaySlot={null}
        defaultShowHistory={showAll}
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
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          status: true,
          missed: true,
          sessionType: true,
        },
        orderBy: { startTime: "asc" },
      }),
    ]);

  const now = new Date();
  // A session belongs to the current stint only if it started after both the
  // pairing and the enrolment. Older rows are kept as history, never counted
  // as the student's absence.
  const floorTime = Math.max(
    schedule.startedAt.getTime(),
    enrollment?.enrolledAt.getTime() ?? schedule.startedAt.getTime(),
  );
  const floor = new Date(floorTime);

  const sessions: SessionRow[] = sessionSchedule
    .filter((session) => session.startTime >= floor)
    .map((session) => ({
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

  const byId = new Map(sessionSchedule.map((session) => [session.id, session]));
  const weekSessions: WeekSession[] = appointments.map((appointment) => {
    const live = byId.get(appointment.id);
    const join =
      live !== undefined
        ? { joinState: live.joinState, opensAt: live.opensAt, closesAt: live.closesAt }
        : (() => {
            const computed = joinStateFor({
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              status: appointment.status,
              now,
            });
            return {
              joinState: computed.state,
              opensAt: computed.opensAt,
              closesAt: computed.closesAt,
            };
          })();
    const beforeYouJoined = appointment.startTime < floor;

    return {
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime?.toISOString() ?? null,
      sessionType: appointment.sessionType,
      joinState: join.joinState,
      opensAt: join.opensAt.toISOString(),
      closesAt: join.closesAt.toISOString(),
      beforeYouJoined,
      statusKey: lessonStatusKey({
        status: appointment.status,
        missed: appointment.missed,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        joinState: join.joinState,
        beforeYouJoined,
        now,
      }),
    };
  });

  const targetLabel =
    sessions.find((session) => session.joinState === "upcoming" || session.joinState === "open")
      ?.planLabel ?? null;

  return (
    <HifdhCourseView
      header={<CourseHeader course={course} />}
      isTest={isTest}
      totalAyahs={TOTAL_QURAN_AYAHS}
      sessions={sessions}
      weekSessions={weekSessions}
      progress={progressSummary}
      targetLabel={targetLabel}
      teacherName={schedule.teacherName}
      teacherImage={schedule.teacherImage}
      todaySlot={
        todaySlot
          ? {
              startTime: todaySlot.startTime.toISOString(),
              endTime: todaySlot.endTime.toISOString(),
              duration: todaySlot.duration,
            }
          : null
      }
      defaultShowHistory={showAll}
      schedule={{
        mentorshipId: schedule.mentorshipId,
        teacherId: schedule.teacherId,
        teacherTimeZone: schedule.teacherTimeZone,
      }}
      teacherAvail={teacherAvail}
      mismatchNotifications={notifications}
    />
  );
}
