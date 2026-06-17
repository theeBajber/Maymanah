import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ustadhId = session.user.id;
    const body = await req.json();
    const { studentId, content, priority, sessionId } = body;

    if (!studentId || !content || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Content must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (!["HIGH", "MEDIUM", "LOW"].includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority" },
        { status: 400 }
      );
    }

    const match = await prisma.mentorship.findFirst({
      where: { teacherId: ustadhId, studentId, status: "ACTIVE" },
    });

    if (!match) {
      return NextResponse.json(
        { error: "No active mentorship with this student" },
        { status: 403 }
      );
    }

    if (sessionId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: sessionId,
          mentorshipId: match.id,
          teacherId: ustadhId,
        },
      });
      if (!appointment) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
    }

    const note = await prisma.studentNote.create({
      data: {
        studentId,
        ustadhId,
        content,
        priority,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
