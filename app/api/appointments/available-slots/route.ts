import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { splitIntoSessions, subtractBooked, timeToMinutes } from "@/lib/scheduling";
import { getCurrentUser } from "@/lib/session";

const querySchema = z.object({
  teacherId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  durationMinutes: z.coerce.number().int().min(15).max(240).default(60),
});

/** Weekday in a timezone, Sunday as zero, without trusting the server clock. */
function weekdayInZone(date: string, timeZone: string): number | null {
  try {
    const noon = new Date(`${date}T12:00:00Z`);
    if (Number.isNaN(noon.getTime())) return null;
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(noon);
    return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday] ?? null;
  } catch {
    return null;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Lists bookable sessions with a teacher on a date.
 *
 * Takes the teacher's recurring availability for that weekday, removes what is
 * already booked, and splits the remainder into sessions. Past dates return
 * nothing rather than an error, since yesterday having no sessions is an
 * answer, not a failure.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a teacher and a date" }, { status: 422 });
  }

  const { teacherId, date, durationMinutes } = parsed.data;

  const teacher = await db.user.findUnique({
    where: { id: teacherId },
    select: { id: true, role: true, profile: { select: { timezone: true } } },
  });
  if (!teacher || teacher.role !== "TEACHER") {
    return NextResponse.json({ error: "That teacher could not be found" }, { status: 404 });
  }

  const dayOfWeek = weekdayInZone(date, teacher.profile?.timezone ?? "Africa/Nairobi");
  if (dayOfWeek === null) {
    return NextResponse.json({ error: "That date could not be understood" }, { status: 422 });
  }

  if (date < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ slots: [] });
  }

  const [availability, booked] = await Promise.all([
    db.availability.findMany({
      where: { userId: teacherId, isRecurring: true, dayOfWeek },
      select: { startTime: true, endTime: true },
    }),
    db.appointment.findMany({
      where: {
        teacherId,
        status: { in: ["SCHEDULED", "ONGOING"] },
        startTime: { gte: new Date(`${date}T00:00:00Z`), lt: new Date(`${date}T23:59:59Z`) },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  const bookedWindows = booked
    .map((appointment) => ({
      startTime: `${String(appointment.startTime.getUTCHours()).padStart(2, "0")}:${String(appointment.startTime.getUTCMinutes()).padStart(2, "0")}`,
      endTime: appointment.endTime
        ? `${String(appointment.endTime.getUTCHours()).padStart(2, "0")}:${String(appointment.endTime.getUTCMinutes()).padStart(2, "0")}`
        : "23:59",
    }))
    .filter((window) => timeToMinutes(window.startTime) !== null);

  const free = subtractBooked(availability, bookedWindows);
  const slots = splitIntoSessions(free, durationMinutes);

  return NextResponse.json({ slots });
}