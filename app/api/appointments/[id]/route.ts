import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

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

  return NextResponse.json({ ok: true });
}
