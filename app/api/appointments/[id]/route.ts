import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { getCurrentUser } from "@/lib/session";
import { timeToMinutes } from "@/lib/scheduling";
import { weekdayInZone, zonedParts } from "@/lib/timezone";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

async function ownAppointment(userId: string, id: string) {
  return db.appointment.findFirst({
    where: {
      id,
      OR: [{ mentorship: { studentId: userId } }, { teacherId: userId }],
    },
    select: {
      id: true,
      title: true,
      status: true,
      startTime: true,
      teacherId: true,
      mentorship: { select: { studentId: true } },
    },
  });
}

const rescheduleSchema = z.object({
  startTime: z.string().datetime({ message: "Start must be an ISO date and time" }),
  durationMinutes: z.number().int().min(15).max(240).default(60),
});

/**
 * Cancels a session.
 *
 * Only a scheduled session can be cancelled. Anything else has either already
 * happened or never will, and cancelling it would rewrite history rather than
 * change the future.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { id } = await params;
  const appointment = await ownAppointment(user.id, id);

  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }
  if (appointment.status !== "SCHEDULED") {
    return NextResponse.json({ error: "Only scheduled sessions can be cancelled" }, { status: 409 });
  }

  await db.appointment.update({ where: { id }, data: { status: "CANCELLED" } });

  return NextResponse.json({ ok: true });
}

/**
 * Moves a session to a new time.
 *
 * The new start must be in the future. Moving a session into the past would
 * create a record of something that never happened at that time.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { id } = await params;
  const appointment = await ownAppointment(user.id, id);

  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }
  if (appointment.status !== "SCHEDULED") {
    return NextResponse.json({ error: "Only scheduled sessions can be moved" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the new time" }, { status: 422 });
  }

  const start = new Date(parsed.data.startTime);
  if (start.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Sessions can only be moved into the future" }, { status: 422 });
  }

  await db.appointment.update({
    where: { id },
    data: { startTime: start, endTime: new Date(start.getTime() + parsed.data.durationMinutes * 60_000) },
  });

  // A teacher may move a session to an hour the student never offered; the
  // student is told, so the conflict is a notice rather than a surprise.
  if (appointment.teacherId === user.id) {
    const studentId = appointment.mentorship.studentId;
    const profile = await db.profile.findUnique({ where: { userId: studentId }, select: { timezone: true } });
    const timeZone = profile?.timezone ?? "Africa/Nairobi";
    const parts = zonedParts(start, timeZone);
    const endParts = zonedParts(new Date(start.getTime() + parsed.data.durationMinutes * 60_000), timeZone);
    const startMinutes = parts.hour * 60 + parts.minute;
    const endMinutes = endParts.hour * 60 + endParts.minute;

    const windows = await db.availability.findMany({
      where: { userId: studentId, isRecurring: true, dayOfWeek: weekdayInZone(start, timeZone) },
      select: { startTime: true, endTime: true },
    });
    const withinAvailability = windows.some((window) => {
      const windowStart = timeToMinutes(window.startTime);
      const windowEnd = timeToMinutes(window.endTime);
      return windowStart !== null && windowEnd !== null && startMinutes >= windowStart && endMinutes <= windowEnd;
    });

    if (!withinAvailability) {
      await createNotification({
        userId: studentId,
        type: "session_rescheduled",
        title: "Session rescheduled",
        body: `${user.name} moved your "${appointment.title || "session"}" to ${start.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}. This time is outside your current availability.`,
        metadata: { appointmentId: id, newTime: start.toISOString(), teacherId: user.id },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
