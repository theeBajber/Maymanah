import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function getTimezoneOffset(tz: string): number {
  const now = new Date();
  const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(noon);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
  const tzMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (tzMs - noon.getTime()) / 60000;
}

function localSlotToUTCMinutes(dayOfWeek: number, time: string, tz: string): number {
  const [h, m] = time.split(":").map(Number);
  const offset = getTimezoneOffset(tz);
  const localMinutes = dayOfWeek * 1440 + h * 60 + m;
  return ((localMinutes - offset) % 10080 + 10080) % 10080;
}

function normalizeRange(startMin: number, endMin: number): { start: number; end: number }[] {
  if (startMin <= endMin) {
    return [{ start: startMin, end: endMin }];
  }
  return [{ start: startMin, end: 10080 }, { start: 0, end: endMin }];
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

function findFreeWindow(
  occupied: { start: number; end: number }[],
  overlapStart: number,
  overlapEnd: number,
  duration: number,
): number | null {
  for (let t = overlapStart; t + duration <= overlapEnd; t += 15) {
    const conflict = occupied.some(s => t < s.end && t + duration > s.start);
    if (!conflict) return t;
  }
  return null;
}

const DAILY_DURATION = 15;
const MURAJA_DURATION = 60;
const WEEKDAYS = [1, 2, 3, 4, 5, 6];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mentorshipId = (await params).id;
    const { slots } = await req.json();

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "At least one slot required" }, { status: 400 });
    }

    const mentorship = await safeQuery(() =>
      prisma.mentorship.findUnique({
        where: { id: mentorshipId },
        select: { studentId: true, teacherId: true },
      }),
    );

    if (!mentorship) {
      return NextResponse.json({ error: "Mentorship not found" }, { status: 404 });
    }

    if (mentorship.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentProfile = await safeQuery(() =>
      prisma.profile.findUnique({ where: { userId: session.user.id }, select: { timezone: true } }),
    );
    const studentTz = studentProfile?.timezone ?? "Africa/Nairobi";

    const teacherProfile = await safeQuery(() =>
      prisma.profile.findUnique({ where: { userId: mentorship.teacherId }, select: { timezone: true } }),
    );
    const teacherTz = teacherProfile?.timezone ?? "Africa/Nairobi";

    // Save student's new availability
    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({
        where: { userId: session.user!.id },
      });
      if (slots.length > 0) {
        await tx.availability.createMany({
          data: slots.map(
            (slot: { dayOfWeek: number; startTime: string; endTime: string }) => ({
              userId: session.user!.id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }),
          ),
        });
      }
    });

    // Convert student's new slots to UTC minutes
    const studentUtcRanges = slots.flatMap(
      (s: { dayOfWeek: number; startTime: string; endTime: string }) =>
        normalizeRange(
          localSlotToUTCMinutes(s.dayOfWeek, s.startTime, studentTz),
          localSlotToUTCMinutes(s.dayOfWeek, s.endTime, studentTz),
        ),
    );

    // Load teacher's availability and convert to UTC
    const teacherAvail = await safeQuery(() =>
      prisma.availability.findMany({
        where: { userId: mentorship.teacherId, isRecurring: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
    );

    if (!teacherAvail?.length) {
      return NextResponse.json({ error: "Teacher has no availability set" }, { status: 400 });
    }

    const teacherUtcRanges = teacherAvail.flatMap(ta =>
      normalizeRange(
        localSlotToUTCMinutes(ta.dayOfWeek, ta.startTime, teacherTz),
        localSlotToUTCMinutes(ta.dayOfWeek, ta.endTime, teacherTz),
      ),
    );

    // Compute overlaps in UTC space
    const daysWithOverlap = new Set<number>();
    const daySlots: { day: number; start: number; end: number }[] = [];
    for (const sr of studentUtcRanges) {
      for (const tr of teacherUtcRanges) {
        if (!rangesOverlap(sr, tr)) continue;
        const start = Math.max(sr.start, tr.start);
        const end = Math.min(sr.end, tr.end);
        if (end - start < 15) continue;
        const utcDay = Math.floor(start / 1440);
        daysWithOverlap.add(utcDay);
        daySlots.push({ day: utcDay, start, end });
      }
    }

    if (daySlots.length === 0) {
      return NextResponse.json(
        { error: "Your availability doesn't overlap with your teacher's availability" },
        { status: 400 },
      );
    }

    daySlots.sort((a, b) => a.day - b.day || a.start - b.start);
    const weekdaySlots = daySlots.filter(s => WEEKDAYS.includes(s.day));

    // Check capacity for daily slots — find free windows
    const existingTeacherDailySlots = await safeQuery(() =>
      prisma.recurringSlot.findMany({
        where: {
          mentorship: { teacherId: mentorship.teacherId, status: "ACTIVE" },
          type: "DAILY_HIFDH",
        },
        select: { dayOfWeek: true, startTime: true, duration: true },
      }),
    );

    const occupiedByDay: Record<number, { start: number; end: number }[]> = {};
    for (const s of existingTeacherDailySlots) {
      if (!occupiedByDay[s.dayOfWeek]) occupiedByDay[s.dayOfWeek] = [];
      occupiedByDay[s.dayOfWeek].push({ start: timeToMinutes(s.startTime), end: timeToMinutes(s.startTime) + s.duration });
    }

    // Check if there's at least one free slot before proceeding
    let hasFreeSlot = false;
    for (const slot of weekdaySlots) {
      const existing = occupiedByDay[slot.day] ?? [];
      if (findFreeWindow(existing, slot.start, slot.end, DAILY_DURATION) !== null) {
        hasFreeSlot = true;
        break;
      }
    }
    if (!hasFreeSlot) {
      return NextResponse.json(
        { error: "No available slots — teacher is at full capacity" },
        { status: 409 },
      );
    }

    // Find existing MURAJA slots used by other students of this teacher
    const existingStudents = await safeQuery(() =>
      prisma.mentorship.findMany({
        where: { teacherId: mentorship.teacherId, status: "ACTIVE" },
        include: { recurringSlots: { where: { type: "MURAJA" } } },
      }),
    );
    const usedMurajaDays = new Set(
      existingStudents.flatMap(m =>
        m.recurringSlots.map(s => s.dayOfWeek),
      ),
    );

    if (usedMurajaDays.size >= 7) {
      return NextResponse.json(
        { error: "Teacher is at full capacity — all 7 days already have muraja sessions" },
        { status: 409 },
      );
    }

    // Delete old recurring slots
    await safeQuery(() =>
      prisma.recurringSlot.deleteMany({ where: { mentorshipId } }),
    );

    // Create DAILY_HIFDH slots (one per day Mon-Sat)
    const seenDays = new Set<number>();
    for (const slot of weekdaySlots) {
      if (seenDays.has(slot.day)) continue;

      const existing = occupiedByDay[slot.day] ?? [];
      const freeStart = findFreeWindow(existing, slot.start, slot.end, DAILY_DURATION);
      if (freeStart === null) continue;

      seenDays.add(slot.day);
      await safeQuery(() =>
        prisma.recurringSlot.create({
          data: {
            mentorshipId,
            type: "DAILY_HIFDH",
            dayOfWeek: slot.day,
            startTime: minutesToTime(freeStart),
            duration: DAILY_DURATION,
          },
        }),
      );
    }

    // Create MURAJA slot
    let murajaDay = [...daysWithOverlap].sort().find(d => !usedMurajaDays.has(d));
    if (murajaDay === undefined) {
      murajaDay = weekdaySlots.length > 0 ? weekdaySlots[0].day : daySlots[0].day;
    }
    const murajaSlot = daySlots.find(s => s.day === murajaDay) ?? daySlots[0];
    const murajaOffset = murajaSlot.start % 1440;
    await safeQuery(() =>
      prisma.recurringSlot.create({
        data: {
          mentorshipId,
          type: "MURAJA",
          dayOfWeek: murajaDay,
          startTime: minutesToTime(murajaOffset),
          duration: MURAJA_DURATION,
        },
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reschedule error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
