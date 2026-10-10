import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const planSchema = z.object({
  fromSurah: z.number().int().min(1).max(114),
  fromVerse: z.number().int().min(1),
  toSurah: z.number().int().min(1).max(114),
  toVerse: z.number().int().min(1),
});

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Reads the plan for a session.
 *
 * Either side of the pairing may read it. The student needs to know what to
 * prepare; restricting it to the teacher would hide the homework.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { id } = await params;

  const appointment = await db.appointment.findFirst({
    where: { id, OR: [{ mentorship: { studentId: user.id } }, { teacherId: user.id }] },
    select: { sessionPlan: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }

  return NextResponse.json({ plan: appointment.sessionPlan });
}

/**
 * Sets what a session is meant to cover.
 *
 * Only the teacher writes it. A plan is replaced rather than edited, so what
 * was intended survives even when the session itself covers something else.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { id } = await params;

  const appointment = await db.appointment.findFirst({
    where: { id },
    select: { id: true, teacherId: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }
  if (appointment.teacherId !== user.id) {
    return NextResponse.json({ error: "Only the teacher sets the plan" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the verses" }, { status: 422 });
  }

  const plan = await db.sessionPlan.upsert({
    where: { appointmentId: id },
    create: { appointmentId: id, ...parsed.data },
    update: { ...parsed.data },
  });

  return NextResponse.json({ plan });
}