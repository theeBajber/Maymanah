import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionSchedule } from "@/lib/agenda";
import { auth } from "@/lib/auth";
import { pendingLessonReports } from "@/lib/lesson-report";
import { planRangeLabel } from "@/lib/live-session";
import { SURAHS, TOTAL_QURAN_AYAHS } from "@/lib/quran-meta";
import { memorizationProgress } from "@/lib/quran-progress";
import { getCurrentUser } from "@/lib/session";
import { SessionsView } from "./SessionsView";
import type { PendingReportRow, ProgressSummary, SessionRow } from "./types";

export const metadata: Metadata = {
  title: "Sessions",
  robots: { index: false, follow: false },
};

/**
 * The schedule screen.
 *
 * The schedule, progress, and pending reports are read together on the server
 * so the first paint is the real list rather than a loading placeholder. The
 * join state on each row is computed there too; the browser only displays it.
 */
export default async function SessionsPage() {
  const user = await getCurrentUser(await auth());
  if (!user) redirect("/login");

  const isStudent = user.role === "STUDENT";

  const [schedule, progress, pending] = await Promise.all([
    getSessionSchedule(user.id),
    isStudent ? memorizationProgress(user.id) : Promise.resolve(null),
    isStudent ? Promise.resolve([]) : pendingLessonReports(user.id),
  ]);

  const sessions: SessionRow[] = schedule.map((session) => ({
    id: session.id,
    title: session.title,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime?.toISOString() ?? null,
    status: session.status,
    sessionType: session.sessionType,
    isTeacher: session.isTeacher,
    otherPartyName: session.otherPartyName,
    planLabel: session.plan ? planRangeLabel(session.plan, SURAHS) : null,
    joinState: session.joinState,
    opensAt: session.opensAt.toISOString(),
    closesAt: session.closesAt.toISOString(),
  }));

  const progressSummary: ProgressSummary | null = progress
    ? {
        rangeCount: progress.rangeCount,
        uniqueAyahs: progress.uniqueAyahs,
        percent: progress.percent,
        lastStop: progress.lastStop,
      }
    : null;

  const pendingReports: PendingReportRow[] = pending.map((row) => ({
    id: row.id,
    title: row.title,
    startTime: row.startTime.toISOString(),
    sessionType: row.sessionType,
    studentName: row.mentorship.student.name,
  }));

  return (
    <SessionsView
      name={user.name}
      isTeacher={!isStudent}
      sessions={sessions}
      progress={progressSummary}
      pendingReports={pendingReports}
      totalAyahs={TOTAL_QURAN_AYAHS}
    />
  );
}
