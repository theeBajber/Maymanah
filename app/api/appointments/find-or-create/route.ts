import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const bookingSchema = z.object({
  teacherId: z.string().min(1),
  startTime: z.string().datetime({ message: "Start must be an ISO date and time" }),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  sessionType: z.enum(["DAILY_HIFDH", "MURAJA", "EXTRA"]).default("EXTRA"),
});

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Books a session, or returns the one already there.
 *
 * Idempotent on teacher, student, and start time: submitting twice — a double
 * click, a retry after a dropped connection — returns the same session rather
 * than booking two. The pairing is found or created first, since a session
 * belongs to a pairing rather than to either person directly.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the details" }, { status: 422 });
  }

  const { teacherId, sessionType } = parsed.data;
  const start = new Date(parsed.data.startTime);
  const end = new Date(start.getTime() + parsed.data.durationMinutes * 60_000);

  if (start.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Sessions can only be booked in the future" }, { status: 422 });
  }

  if (teacherId === user.id) {
    return NextResponse.json({ error: "You cannot book a session with yourself" }, { status: 422 });
  }

  const teacher = await db.user.findUnique({ where: { id: teacherId }, select: { id: true, role: true } });
  if (!teacher || teacher.role !== "TEACHER") {
    return NextResponse.json({ error: "That teacher could not be found" }, { status: 404 });
  }

  const mentorship = await db.mentorship.upsert({
    where: { teacherId_studentId: { teacherId, studentId: user.id } },
    create: { teacherId, studentId: user.id },
    update: {},
    select: { id: true, status: true },
  });

  if (mentorship.status !== "ACTIVE") {
    return NextResponse.json({ error: "That pairing is no longer active" }, { status: 409 });
  }

  // A session starting within a minute of an existing one is the same session
  // submitted twice, not two sessions a minute apart.
  const existing = await db.appointment.findFirst({
    where: {
      mentorshipId: mentorship.id,
      status: { in: ["SCHEDULED", "ONGOING"] },
      startTime: { gte: new Date(start.getTime() - 60_000), lte: new Date(start.getTime() + 60_000) },
    },
    select: { id: true },
  });

  if (existing) return NextResponse.json({ id: existing.id, booked: false });

  const appointment = await db.appointment.create({
    data: {
      mentorshipId: mentorship.id,
      teacherId,
      sessionType,
      startTime: start,
      endTime: end,
      status: "SCHEDULED",
    },
    select: { id: true },
  });

  return NextResponse.json({ id: appointment.id, booked: true }, { status: 201 });
}