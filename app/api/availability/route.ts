import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const saveSchema = z.object({
  slots: z.array(slotSchema),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availabilities = await prisma.availability.findMany({
      where: { userId: session.user.id, isRecurring: true },
      select: { dayOfWeek: true, startTime: true, endTime: true },
    });

    return NextResponse.json({ slots: availabilities });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid slots", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slots } = parsed.data;

    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        return NextResponse.json(
          { error: `Invalid time range for day ${slot.dayOfWeek}: start must be before end` },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({
        where: { userId: session.user.id, isRecurring: true },
      });

      if (slots.length > 0) {
        await tx.availability.createMany({
          data: slots.map((slot) => ({
            userId: session.user.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isRecurring: true,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save availability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
