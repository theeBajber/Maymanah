import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const suggestSchema = z.object({
  type: z.enum(["DAILY_HIFDH", "MURAJA"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = suggestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const mentorship = await prisma.mentorship.findFirst({
      where: { studentId: session.user.id, status: "ACTIVE" },
      select: { id: true, teacherId: true },
    });
    if (!mentorship) {
      return NextResponse.json({ error: "No active mentorship" }, { status: 400 });
    }

    const existing = await prisma.recurringSlot.findFirst({
      where: { mentorshipId: mentorship.id, type: parsed.data.type },
    });
    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    await prisma.recurringSlot.update({
      where: { id: existing.id },
      data: {
        startTime: parsed.data.startTime,
        ...(parsed.data.dayOfWeek !== undefined && { dayOfWeek: parsed.data.dayOfWeek }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update recurring slot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
