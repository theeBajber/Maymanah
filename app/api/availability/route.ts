import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Start must be a time like 09:00"),
  endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "End must be a time like 17:00"),
});

const saveSchema = z.object({
  slots: z.array(slotSchema).max(49),
});

/** The weekly availability, as day-grouped slots. */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const rows = await db.availability.findMany({
    where: { userId: user.id, isRecurring: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    select: { dayOfWeek: true, startTime: true, endTime: true },
  });

  return NextResponse.json({ slots: rows });
}

/**
 * Replaces the weekly availability.
 *
 * Each slot's end must be after its start on the same day, since a window that
 * ends before it begins is never satisfiable and would silently exclude the
 * whole day from matching. The whole set is replaced rather than patched, so a
 * removed slot cannot survive as a leftover row.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the slots" }, { status: 422 });
  }

  for (const slot of parsed.data.slots) {
    if (slot.endTime <= slot.startTime) {
      return NextResponse.json(
        { error: `The slot ending at ${slot.endTime} ends before it starts` },
        { status: 422 },
      );
    }
  }

  await db.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { userId: user.id, isRecurring: true } });
    if (parsed.data.slots.length > 0) {
      await tx.availability.createMany({
        data: parsed.data.slots.map((slot) => ({ userId: user.id, ...slot, isRecurring: true })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
