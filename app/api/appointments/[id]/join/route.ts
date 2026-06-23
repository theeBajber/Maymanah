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

    const roomName = `session_${id}`;
    const userName = session.user.name ?? "User";
    const identity = `${userId}_${Date.now()}`;

    const token = generateLiveKitToken({ identity, name: userName, roomName });

    const liveKitUrl =
      process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "wss://your-livekit-instance.com";

    return NextResponse.json({
      token,
      roomName,
      liveKitUrl,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        startTime: appointment.startTime,
        status: appointment.status,
        isTeacher,
      },
    });
  } catch (error) {
    console.error("Join appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
