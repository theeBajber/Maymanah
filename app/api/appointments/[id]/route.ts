import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";

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
        title: true,
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

      const conflict = await prisma.appointment.findFirst({
        where: {
          teacherId: appointment.teacherId,
          id: { not: id },
          status: { not: "CANCELLED" },
          startTime: { lt: newEnd },
          endTime: { gte: newStart },
        },
      });
      if (conflict) {
        return NextResponse.json({ error: "Teacher already has a session at this time" }, { status: 409 });
      }

      await prisma.appointment.update({
        where: { id },
        data: { startTime: newStart, endTime: newEnd },
      });

      let availabilityMismatch = false;
      const studentId = appointment.mentorship?.studentId;
      if (isTeacher && studentId) {
        const newDayOfWeek = newStart.getUTCDay();
        const newStartMin = newStart.getUTCHours() * 60 + newStart.getUTCMinutes();
        const newEndMin = newEnd.getUTCHours() * 60 + newEnd.getUTCMinutes();

        const studentAvail = await prisma.availability.findMany({
          where: { userId: studentId, isRecurring: true, dayOfWeek: newDayOfWeek },
          select: { startTime: true, endTime: true },
        });

        const withinAvailability = studentAvail.some((a) => {
          const aStart = parseInt(a.startTime.split(":")[0]) * 60 + parseInt(a.startTime.split(":")[1]);
          const aEnd = parseInt(a.endTime.split(":")[0]) * 60 + parseInt(a.endTime.split(":")[1]);
          return newStartMin >= aStart && newEndMin <= aEnd;
        });

        if (!withinAvailability) {
          availabilityMismatch = true;
          const teacher = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true },
          });
          await createNotification({
            userId: studentId,
            type: "session_rescheduled",
            title: "Session rescheduled",
            body: `${teacher?.name || "Your teacher"} moved your "${
              appointment.title || "session"
            }" to ${newStart.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}. This time is outside your current availability.`,
            metadata: {
              appointmentId: id,
              newTime: newStart.toISOString(),
              teacherId: session.user.id,
            },
          });
        }
      }

      return NextResponse.json({ success: true, action: "rescheduled", availabilityMismatch });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
