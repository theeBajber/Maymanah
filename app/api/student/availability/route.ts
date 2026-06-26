import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slots } = body;

    if (!Array.isArray(slots)) {
      return NextResponse.json({ error: "Invalid slots data" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({
        where: { userId: session.user.id },
      });

      if (slots.length > 0) {
        await tx.availability.createMany({
          data: slots.map(
            (slot: { dayOfWeek: number; startTime: string; endTime: string }) => ({
              userId: session.user.id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }),
          ),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slots = await prisma.availability.findMany({
      where: { userId: session.user.id },
      select: { id: true, dayOfWeek: true, startTime: true, endTime: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
