import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";

const disableSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

const DISABLE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

/**
 * Turns two-factor authentication off.
 *
 * Requires the current password even though the session is valid, so a
 * borrowed or left-open browser cannot quietly remove the protection. The form
 * asks for the password alone; the session gate, the password check, and the
 * rate limit together are what stand between a stolen cookie and this switch.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  const limit = await consumeRateLimit({ key: `2fa:disable:${user.id}`, ...DISABLE_LIMIT });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = disableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your password" }, { status: 422 });
  }

  const stored = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, twoFactorEnabled: true } });
  if (!stored?.twoFactorEnabled) {
    return NextResponse.json({ error: "Two-factor authentication is not on" }, { status: 409 });
  }

  if (!(await verifyPassword(parsed.data.password, stored.passwordHash))) {
    return NextResponse.json({ error: "That password is not correct" }, { status: 401 });
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false } });
    await tx.twoFactorCode.updateMany({ where: { userId: user.id, consumedAt: null }, data: { consumedAt: new Date() } });
  });

  return NextResponse.json({ ok: true });
}