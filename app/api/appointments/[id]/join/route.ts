import { auth } from "@/lib/auth";
import { generateLiveKitToken } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        mentorship: { select: { teacherId: true, studentId: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isTeacher = appointment.teacherId === userId;
    const isStudent = appointment.mentorship.studentId === userId;

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const otherUserId = isTeacher ? appointment.mentorship.studentId : appointment.teacherId;

    const now = new Date();
    const isTest = new URL(_req.url).searchParams.has("test");
    if (!isTest && now < appointment.startTime) {
      return NextResponse.json({ error: "Session hasn't started yet" }, { status: 400 });
    }
    if (!isTest && appointment.endTime && now > appointment.endTime) {
      return NextResponse.json({ error: "Session has ended" }, { status: 400 });
    }

    const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;
    if (!liveKitUrl || !liveKitUrl.startsWith("wss://")) {
      return NextResponse.json(
        { error: "LiveKit WebSocket URL is not configured. Set NEXT_PUBLIC_LIVEKIT_URL or LIVEKIT_URL in .env (e.g. wss://my-project.livekit.cloud)" },
        { status: 500 },
      );
    }

    const roomName = `session_${id}`;
    const userName = session.user.name ?? "User";
    const identity = `${userId}_${Date.now()}`;

    const token = await generateLiveKitToken({ identity, name: userName, roomName });

    return NextResponse.json({
      token,
      roomName,
      liveKitUrl,
      otherUserId,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        startTime: appointment.startTime,
        status: appointment.status,
        isTeacher,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Join appointment error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
