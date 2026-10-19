import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { splitIntoSessions, subtractBooked, timeToMinutes } from "@/lib/scheduling";
import { getCurrentUser } from "@/lib/session";
import { formatZonedTime, weekdayOfDate, zonedParts, zonedTimeToUtc } from "@/lib/timezone";

const querySchema = z.object({
  teacherId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  durationMinutes: z.coerce.number().int().min(15).max(240).default(60),
});

function addDays(
  year: number,
  month: number,
  day: number,
  offset: number,
): { year: number; month: number; day: number } {
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + offset);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** A calendar date with no zone attached, or null if it does not exist. */
function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Lists bookable sessions with a teacher on a date.
 *
 * The date is a day on the teacher's own calendar, and the availability and
 * existing bookings are both read on that same clock, so a teacher in Nairobi
 * sees their 09:00 rather than a UTC 09:00 that is really noon. Each result
 * carries the instant it begins, resolved against the offset that date
 * actually has, plus the teacher-local label to display.
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

  const calendar = parseDate(date);
  if (!calendar) {
    return NextResponse.json({ error: "That date could not be understood" }, { status: 422 });
  }

  const timeZone = teacher.profile?.timezone ?? "Africa/Nairobi";
  const dayOfWeek = weekdayOfDate(calendar.year, calendar.month, calendar.day);
  const dayStart = zonedTimeToUtc(calendar.year, calendar.month, calendar.day, 0, 0, timeZone);
  const next = addDays(calendar.year, calendar.month, calendar.day, 1);
  const dayEnd = zonedTimeToUtc(next.year, next.month, next.day, 0, 0, timeZone);

  const now = new Date();
  if (dayEnd <= now) return NextResponse.json({ timeZone, slots: [] });

  const [availability, booked] = await Promise.all([
    db.availability.findMany({
      where: { userId: teacherId, isRecurring: true, dayOfWeek },
      select: { startTime: true, endTime: true },
    }),
    db.appointment.findMany({
      where: {
        teacherId,
        status: { in: ["SCHEDULED", "ONGOING"] },
        startTime: { gte: dayStart, lt: dayEnd },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  const bookedWindows = booked
    .map((appointment) => {
      const start = zonedParts(appointment.startTime, timeZone);
      const end = appointment.endTime ? zonedParts(appointment.endTime, timeZone) : { hour: 23, minute: 59 };
      return {
        startTime: formatZonedTime(start.hour, start.minute),
        endTime: formatZonedTime(end.hour, end.minute),
      };
    })
    .filter((window) => timeToMinutes(window.startTime) !== null);

  const free = subtractBooked(availability, bookedWindows);
  const slots = splitIntoSessions(free, durationMinutes)
    .map((session) => {
      const [startHour, startMinute] = session.startTime.split(":").map(Number);
      const [endHour, endMinute] = session.endTime.split(":").map(Number);
      return {
        label: session.startTime,
        startTime: zonedTimeToUtc(calendar.year, calendar.month, calendar.day, startHour, startMinute, timeZone).toISOString(),
        endTime: zonedTimeToUtc(calendar.year, calendar.month, calendar.day, endHour, endMinute, timeZone).toISOString(),
      };
    })
    .filter((slot) => new Date(slot.startTime) > now);

  return NextResponse.json({ timeZone, slots });
}
