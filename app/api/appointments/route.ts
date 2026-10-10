import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Lists the signed-in user's sessions, soonest first.
 *
 * Reads both sides of every pairing the person belongs to — as the student
 * through the pairing, as the teacher directly — so neither role needs its own
 * endpoint. Cancelled sessions are omitted; history is not a schedule.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  const appointments = await db.appointment.findMany({
    where: {
      status: { in: ["SCHEDULED", "ONGOING"] },
      OR: [{ mentorship: { studentId: user.id } }, { teacherId: user.id }],
    },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      sessionType: true,
      teacherId: true,
      mentorship: {
        select: {
          student: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true } },
        },
      },
      sessionPlan: true,
    },
  });

  return NextResponse.json({
    sessions: appointments.map((appointment) => ({
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      sessionType: appointment.sessionType,
      isTeacher: appointment.teacherId === user.id,
      otherParty:
        appointment.teacherId === user.id ? appointment.mentorship.student : appointment.mentorship.teacher,
      plan: appointment.sessionPlan,
    })),
  });
}