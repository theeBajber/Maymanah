import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  action: z.enum(["cancel", "reschedule"]),
  startTime: z.string().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        teacherId: true,
        status: true,
        mentorship: { select: { studentId: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const isTeacher = appointment.teacherId === session.user.id;
    const isStudent = appointment.mentorship?.studentId === session.user.id;
    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (appointment.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Can only modify scheduled appointments" }, { status: 400 });
    }

    if (parsed.data.action === "cancel") {
      await prisma.appointment.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ success: true, action: "cancelled" });
    }

    if (parsed.data.action === "reschedule") {
      if (!parsed.data.startTime) {
        return NextResponse.json({ error: "startTime required for reschedule" }, { status: 400 });
      }
      const newStart = new Date(parsed.data.startTime);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      await prisma.appointment.update({
        where: { id },
        data: { startTime: newStart, endTime: newEnd },
      });
      return NextResponse.json({ success: true, action: "rescheduled" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
