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

const BLOCK = 30;
const MAX_PER_BLOCK = 2;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const mentorshipId = searchParams.get("mentorshipId");
    const dateStr = searchParams.get("date");
    const sessionType = searchParams.get("sessionType") ?? "DAILY_HIFDH";

    if (!teacherId || !mentorshipId || !dateStr) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00Z");
    const dayOfWeek = date.getUTCDay();

    const teacherAvail = await safeQuery(() =>
      prisma.availability.findMany({
        where: { userId: teacherId, isRecurring: true, dayOfWeek },
        orderBy: { startTime: "asc" },
      }),
    );

    if (!teacherAvail?.length) {
      return NextResponse.json({ slots: [] });
    }

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const existingAppts = await safeQuery(() =>
      prisma.appointment.findMany({
        where: {
          teacherId,
          startTime: { gte: dayStart, lte: dayEnd },
          status: { not: "CANCELLED" },
        },
        select: { startTime: true, endTime: true },
      }),
    );

    function countOverlapping(start: Date, end: Date) {
      return (existingAppts ?? []).filter((apt) => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime ?? aptStart.getTime() + 3600000);
        return start < aptEnd && end > aptStart;
      }).length;
    }

    const allBlocks: { start: Date; end: Date; key: string }[] = [];

    for (const avail of teacherAvail) {
      const startMin = timeToMinutes(avail.startTime);
      const endMin = timeToMinutes(avail.endTime);
      for (let m = startMin; m + BLOCK <= endMin; m += BLOCK) {
        const blockStart = new Date(date);
        blockStart.setUTCHours(0, Math.floor(m / 60) * 60 + (m % 60), 0, 0);
        const blockEnd = new Date(blockStart.getTime() + BLOCK * 60000);
        const key = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
        allBlocks.push({ start: blockStart, end: blockEnd, key });
      }
    }

    const slots: { startTime: string; endTime: string; type: string }[] = [];

    if (sessionType === "MURAJA") {
      for (let i = 0; i < allBlocks.length - 1; i++) {
        const b1 = allBlocks[i];
        const b2 = allBlocks[i + 1];
        if (countOverlapping(b1.start, b1.end) < MAX_PER_BLOCK &&
            countOverlapping(b2.start, b2.end) < MAX_PER_BLOCK) {
          const startTime = b1.start.toISOString();
          const endTime = b2.end.toISOString();
          slots.push({ startTime, endTime, type: "MURAJA" });
        }
      }
    } else {
      for (const block of allBlocks) {
        if (countOverlapping(block.start, block.end) < MAX_PER_BLOCK) {
          const slotEnd = new Date(block.start.getTime() + 15 * 60000);
          slots.push({
            startTime: block.start.toISOString(),
            endTime: slotEnd.toISOString(),
            type: "DAILY_HIFDH",
          });
        }
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Available slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
