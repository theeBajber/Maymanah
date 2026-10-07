import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Only teachers can do this" }, { status: 403 });
}

async function teacherId(): Promise<string | null> {
  const user = await getCurrentUser(await auth());
  if (!user) return null;
  if (user.role !== "TEACHER") return null;
  return user.id;
}

/** A teacher's approval standing and whether they accept new pairings. */
export async function GET(): Promise<NextResponse> {
  const id = await teacherId();
  if (id === null) {
    const user = await getCurrentUser(await auth());
    if (!user) return unauthorized();
    return forbidden();
  }

  const profile = await db.ustadhProfile.findUnique({ where: { userId: id } });

  return NextResponse.json({
    availableForTeaching: profile?.availableForTeaching ?? false,
    isApproved: profile?.isApproved ?? false,
  });
}

const patchSchema = z.object({
  availableForTeaching: z.boolean(),
});

/** Flips whether a teacher accepts new pairings. Approval itself is untouched. */
export async function PATCH(request: Request): Promise<NextResponse> {
  const id = await teacherId();
  if (id === null) {
    const user = await getCurrentUser(await auth());
    if (!user) return unauthorized();
    return forbidden();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Say whether you accept new pairings" }, { status: 422 });
  }

  const profile = await db.ustadhProfile.upsert({
    where: { userId: id },
    create: { userId: id, availableForTeaching: parsed.data.availableForTeaching },
    update: { availableForTeaching: parsed.data.availableForTeaching },
  });

  return NextResponse.json(profile);
}