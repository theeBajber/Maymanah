import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rescheduleStudent } from "@/lib/pairing";
import { getCurrentUser } from "@/lib/session";

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Start must be a time like 09:00"),
  endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "End must be a time like 17:00"),
});

const bodySchema = z.object({
  slots: z.array(slotSchema).min(1, "Select at least one time slot"),
});

/**
 * Replaces a paired student's availability and rebuilds their weekly slots.
 *
 * The new availability is written first because it is the student's actual
 * answer about when they are free; the slots are then replanned against it.
 * The teacher does not change — a student wanting a different mentor ends the
 * pairing and is matched again instead.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const { id } = await params;
  const mentorship = await db.mentorship.findFirst({
    where: { id, studentId: user.id, status: "ACTIVE" },
    select: { id: true },
  });
  if (!mentorship) {
    return NextResponse.json({ error: "That pairing could not be found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your slots" }, { status: 422 });
  }

  for (const slot of parsed.data.slots) {
    if (slot.endTime <= slot.startTime) {
      return NextResponse.json(
        { error: `The slot ending at ${slot.endTime} ends before it starts` },
        { status: 422 },
      );
    }
  }

  await db.$transaction([
    db.availability.deleteMany({ where: { userId: user.id, isRecurring: true } }),
    db.availability.createMany({
      data: parsed.data.slots.map((slot) => ({
        userId: user.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: true,
      })),
    }),
  ]);

  const result = await rescheduleStudent(user.id);
  if (result.ok) return NextResponse.json({ success: true });

  if (result.reason === "no_overlap") {
    return NextResponse.json(
      { error: "Your availability doesn't overlap with your teacher's availability" },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "That pairing could not be found" }, { status: 404 });
}
