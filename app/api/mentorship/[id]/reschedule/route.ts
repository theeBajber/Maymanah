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

function intersection(
  aStart: string, aEnd: string,
  bStart: string, bEnd: string,
) {
  const start = Math.max(timeToMinutes(aStart), timeToMinutes(bStart));
  const end = Math.min(timeToMinutes(aEnd), timeToMinutes(bEnd));
  if (end - start < 15) return null;
  return { start: minutesToTime(start), end: minutesToTime(end) };
}

const DAILY_DURATION = 15;
const MURAJA_DURATION = 60;
const WEEKDAYS = [1, 2, 3, 4, 5];
const BLOCK = 30;
const MAX_PER_BLOCK = 2;

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

    // Load teacher's availability
    const teacherAvail = await safeQuery(() =>
      prisma.availability.findMany({
        where: { userId: mentorship.teacherId, isRecurring: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
    );

    if (!teacherAvail?.length) {
      return NextResponse.json({ error: "Teacher has no availability set" }, { status: 400 });
    }

    // Compute overlaps
    const daySlots: { day: number; start: string; end: string }[] = [];
    for (const sa of slots) {
      for (const ta of teacherAvail) {
        if (sa.dayOfWeek !== ta.dayOfWeek) continue;
        const inter = intersection(sa.startTime, sa.endTime, ta.startTime, ta.endTime);
        if (inter) {
          daySlots.push({ day: sa.dayOfWeek, start: inter.start, end: inter.end });
        }
      }
    }

    if (daySlots.length === 0) {
      return NextResponse.json(
        { error: "Your availability doesn't overlap with your teacher's availability" },
        { status: 400 },
      );
    }

    daySlots.sort((a, b) => a.day - b.day || timeToMinutes(a.start) - timeToMinutes(b.start));
    const daysWithOverlap = new Set(daySlots.map((s) => s.day));
    const weekdaySlots = daySlots.filter((s) => WEEKDAYS.includes(s.day));

    // Check capacity for daily slots
    for (const slot of weekdaySlots) {
      const blockStart = Math.floor(timeToMinutes(slot.start) / BLOCK) * BLOCK;
      const blockStartStr = minutesToTime(blockStart);

      const existingInBlock = await prisma.recurringSlot.count({
        where: {
          mentorship: { teacherId: mentorship.teacherId, status: "ACTIVE" },
          type: "DAILY_HIFDH",
          dayOfWeek: slot.day,
          startTime: blockStartStr,
        },
      });

      if (existingInBlock >= MAX_PER_BLOCK) {
        return NextResponse.json(
          { error: `No available capacity in the ${minutesToTime(blockStart)} block on day ${slot.day}` },
          { status: 409 },
        );
      }
    }

    // Find existing MURAJA slots used by other students of this teacher
    const existingStudents = await safeQuery(() =>
      prisma.mentorship.findMany({
        where: { teacherId: mentorship.teacherId, status: "ACTIVE" },
        include: { recurringSlots: { where: { type: "MURAJA" } } },
      }),
    );
    const usedMurajaDays = new Set(
      existingStudents.flatMap((m) =>
        m.recurringSlots.map((s) => s.dayOfWeek),
      ),
    );

    // Delete old recurring slots
    await safeQuery(() =>
      prisma.recurringSlot.deleteMany({ where: { mentorshipId } }),
    );

    // Create DAILY_HIFDH slots (one per weekday)
    const seenWeekdays = new Set<number>();
    for (const slot of weekdaySlots) {
      if (seenWeekdays.has(slot.day)) continue;
      seenWeekdays.add(slot.day);
      await safeQuery(() =>
        prisma.recurringSlot.create({
          data: {
            mentorshipId,
            type: "DAILY_HIFDH",
            dayOfWeek: slot.day,
            startTime: slot.start,
            duration: DAILY_DURATION,
          },
        }),
      );
    }

    // Create MURAJA slot
    let murajaDay = [...daysWithOverlap].sort().find((d) => !usedMurajaDays.has(d));
    if (murajaDay === undefined) {
      murajaDay = weekdaySlots.length > 0 ? weekdaySlots[0].day : daySlots[0].day;
    }
    const murajaSlot = daySlots.find((s) => s.day === murajaDay) ?? daySlots[0];
    await safeQuery(() =>
      prisma.recurringSlot.create({
        data: {
          mentorshipId,
          type: "MURAJA",
          dayOfWeek: murajaDay,
          startTime: murajaSlot.start,
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
