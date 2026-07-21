import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function localTimeToUTC(dateStr: string, timeStr: string, tz: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const ref = new Date(dateStr + "T12:00:00Z");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(ref);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
  const localH = get("hour"), localMi = get("minute");
  const diff = (h * 60 + m) - (localH * 60 + localMi);
  return new Date(ref.getTime() + diff * 60000);
}

function getLocalDayOfWeek(dateStr: string, tz: string): number {
  const ref = new Date(dateStr + "T12:00:00Z");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    weekday: "long",
  }).formatToParts(ref);
  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  };
  return dayMap[parts.find(p => p.type === "weekday")!.value];
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const dateStr = searchParams.get("date");
    const sessionType = searchParams.get("sessionType") ?? "DAILY_HIFDH";

    if (!teacherId || !dateStr) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const tzProfile = await safeQuery(() =>
      prisma.profile.findUnique({ where: { userId: teacherId }, select: { timezone: true } }),
    );
    const tz = tzProfile?.timezone ?? "Africa/Nairobi";

    const dayOfWeek = getLocalDayOfWeek(dateStr, tz);

    const sourceAvail = await safeQuery(() =>
      prisma.availability.findMany({
        where: { userId: teacherId, isRecurring: true, dayOfWeek },
        orderBy: { startTime: "asc" },
      }),
    );

    if (!sourceAvail?.length) {
      return NextResponse.json({ slots: [] });
    }

    const dayStart = localTimeToUTC(dateStr, "00:00", tz);
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const existingAppts = await safeQuery(() =>
      prisma.appointment.findMany({
        where: {
          teacherId,
          startTime: { gte: dayStart, lt: dayEnd },
          status: { not: "CANCELLED" },
        },
        select: { startTime: true, endTime: true },
      }),
    );

    function hasConflict(start: Date, end: Date) {
      return (existingAppts ?? []).some((apt) => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime ?? aptStart.getTime() + 3600000);
        return start < aptEnd && end > aptStart;
      });
    }

    const slots: { startTime: string; endTime: string; type: string }[] = [];

    if (sessionType === "MURAJA") {
      const duration = 60;
      for (const avail of sourceAvail) {
        const startMin = timeToMinutes(avail.startTime);
        const endMin = timeToMinutes(avail.endTime);
        for (let m = startMin; m + duration <= endMin; m += 15) {
          const slotStart = localTimeToUTC(dateStr, minutesToTime(m), tz);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);
          if (!hasConflict(slotStart, slotEnd)) {
            slots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              type: "MURAJA",
            });
          }
        }
      }
    } else {
      const duration = 15;
      for (const avail of sourceAvail) {
        const startMin = timeToMinutes(avail.startTime);
        const endMin = timeToMinutes(avail.endTime);
        for (let m = startMin; m + duration <= endMin; m += 15) {
          const slotStart = localTimeToUTC(dateStr, minutesToTime(m), tz);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);
          if (!hasConflict(slotStart, slotEnd)) {
            slots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              type: "DAILY_HIFDH",
            });
          }
        }
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Available slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
