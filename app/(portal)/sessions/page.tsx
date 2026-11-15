import type { Metadata } from "next";
import { redirect } from "next/navigation";

import type { PendingReportRow, SessionRow } from "@/app/ui/session-cards";
import { getSessionSchedule } from "@/lib/agenda";
import { auth } from "@/lib/auth";
import { pendingLessonReports } from "@/lib/lesson-report";
import { planRangeLabel } from "@/lib/live-session";
import { SURAHS } from "@/lib/quran-meta";
import { getCurrentUser } from "@/lib/session";
import { SessionsView } from "./SessionsView";

export const metadata: Metadata = {
  title: "Sessions",
  robots: { index: false, follow: false },
};

/**
 * The teacher's schedule screen.
 *
 * Students are sent to their course, where the next lesson and its join button
 * now live. The schedule and pending reports are read together on the server,
 * so the first paint is the real list rather than a loading placeholder.
 */
export default async function SessionsPage() {
  const user = await getCurrentUser(await auth());
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/courses/hifdh-ul-quran");

  const [schedule, pending] = await Promise.all([
    getSessionSchedule(user.id),
    pendingLessonReports(user.id),
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
      sessions={sessions}
      pendingReports={pendingReports}
    />
  );
}
