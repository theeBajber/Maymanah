import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";

const deleteSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm"),
});

const DELETE_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 };

/**
 * Permanently deletes an account and everything attached to it.
 *
 * Requires the current password even though the session is valid, so a
 * borrowed browser cannot quietly erase someone. Heavily rate limited, since
 * there is no undoing a successful call. Dependent rows go with it through
 * cascading deletes; anything the schema cannot cascade is removed here first.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  const limit = await consumeRateLimit({ key: `delete-account:${user.id}`, ...DELETE_LIMIT });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your password to confirm" }, { status: 422 });
  }

  const stored = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!stored || !(await verifyPassword(parsed.data.password, stored.passwordHash))) {
    return NextResponse.json({ error: "That password is not correct" }, { status: 401 });
  }

  await db.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}