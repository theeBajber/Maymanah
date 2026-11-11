import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** A session is joinable from fifteen minutes before it starts... */
const JOIN_EARLY_MS = 15 * 60 * 1000;

/** ...until an hour after it was meant to end, for sessions that run over. */
const JOIN_LATE_MS = 60 * 60 * 1000;

/**
 * Everything the session page shows before a call starts.
 *
 * Either side of the pairing may read it. The response separates what the
 * session is (`plan`), how it went (`report`), and whether a call can start
 * now, so the page can show a pending report long after joining has closed.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const { id } = await params;

  const appointment = await db.appointment.findFirst({
    where: { id, OR: [{ mentorship: { studentId: user.id } }, { teacherId: user.id }] },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      sessionType: true,
      teacherId: true,
      joinedAt: true,
      mentorship: {
        select: {
          studentId: true,
          student: { select: { name: true } },
          teacher: { select: { name: true } },
        },
      },
      sessionPlan: true,
      report: {
        select: {
          id: true,
          attendance: true,
          fromSurah: true,
          fromVerse: true,
          toSurah: true,
          toVerse: true,
          revision: true,
          rating: true,
          notes: true,
          nextAssignment: true,
          submittedAt: true,
          submittedBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }

  const now = Date.now();
  const start = appointment.startTime.getTime();
  const end = appointment.endTime?.getTime() ?? start + JOIN_LATE_MS;
  const isTeacher = appointment.teacherId === user.id;
  const cancelled = appointment.status === "CANCELLED";

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      sessionType: appointment.sessionType,
      isTeacher,
      studentId: appointment.mentorship.studentId,
      otherPartyName: isTeacher
        ? appointment.mentorship.student.name
        : appointment.mentorship.teacher.name,
      canJoin:
        !cancelled &&
        appointment.status !== "COMPLETED" &&
        now >= start - JOIN_EARLY_MS &&
        now <= end + JOIN_LATE_MS,
      hasStarted: now >= start - JOIN_EARLY_MS,
      hasEnded: now > end,
    },
    plan: appointment.sessionPlan,
    report: appointment.report,
  });
}
