import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { createTodaysAppointment, getTodayHifdhSlot } from "@/lib/mentorship";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await safeQuery(() =>
      prisma.profile.findUnique({ where: { userId: session.user.id }, select: { timezone: true } }),
    );
    const tz = profile?.timezone;

    const slot = await getTodayHifdhSlot(session.user.id, tz);
    if (!slot) {
      return NextResponse.json({ error: "No daily session scheduled for today" }, { status: 400 });
    }

    const now = new Date();
    const searchParams = new URL(req.url).searchParams;
    if (!searchParams.has("test")) {
      if (now < slot.startTime) {
        return NextResponse.json({ error: "Session hasn't started yet" }, { status: 400 });
      }
      if (now > slot.endTime) {
        return NextResponse.json({ error: "Session has ended" }, { status: 400 });
      }
    }

    const appointment = await createTodaysAppointment(session.user.id);
    if (!appointment) {
      return NextResponse.json({ error: "Could not create session" }, { status: 500 });
    }

    return NextResponse.json({ id: appointment.id });
  } catch (error) {
    console.error("Daily appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
