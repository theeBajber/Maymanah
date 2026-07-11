import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { updateHifdhProgress } from "@/lib/progress";

const planSchema = z.object({
  fromSurah: z.number().int().min(1).max(114),
  fromVerse: z.number().int().min(1),
  toSurah: z.number().int().min(1).max(114),
  toVerse: z.number().int().min(1),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { id: true, teacherId: true, mentorship: { select: { teacherId: true, studentId: true } } },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const isTeacher = appointment.teacherId === session.user.id || appointment.mentorship?.teacherId === session.user.id;
    if (!isTeacher) {
      return NextResponse.json({ error: "Only the teacher can set session plans" }, { status: 403 });
    }

    const plan = await prisma.sessionPlan.upsert({
      where: { appointmentId: id },
      create: { appointmentId: id, ...parsed.data },
      update: parsed.data,
    });

    const studentId = appointment.mentorship?.studentId;
    if (studentId) {
      updateHifdhProgress(studentId).catch((err) =>
        console.error("updateHifdhProgress error:", err),
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error setting session plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const plan = await prisma.sessionPlan.findUnique({
      where: { appointmentId: id },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error fetching session plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
