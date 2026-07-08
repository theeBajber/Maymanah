import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mentorshipId, teacherId, sessionType, startTime, endTime } = await req.json();

    if (!mentorshipId || !teacherId || !sessionType || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + (sessionType === "MURAJA" ? 60 : 15) * 60000);

    const existing = await safeQuery(() =>
      prisma.appointment.findFirst({
        where: { mentorshipId, sessionType, startTime: start },
        select: { id: true },
      }),
    );

    if (existing) {
      return NextResponse.json({ id: existing.id });
    }

    const appointment = await safeQuery(() =>
      prisma.appointment.create({
        data: {
          mentorshipId,
          teacherId,
          title: sessionType === "MURAJA" ? "Muraja'ah Session" : "Daily Hifdh Session",
          startTime: start,
          endTime: end,
          sessionType,
          meetingUrl: `${sessionType === "MURAJA" ? "muraja" : "hifdh"}-${mentorshipId}-${Date.now()}`,
          status: "SCHEDULED",
        },
      }),
    );

    return NextResponse.json({ id: appointment.id });
  } catch (error) {
    console.error("Find-or-create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
