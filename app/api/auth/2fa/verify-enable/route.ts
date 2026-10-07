import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { evaluateTwoFactorCode } from "@/lib/two-factor";
import { verifyOneTimeCode } from "@/lib/password";
import { consumeRateLimit } from "@/lib/rate-limit";
import { ONE_TIME_CODE_MAX_ATTEMPTS } from "@/lib/tokens";

const verifySchema = z.object({
  otpCode: z.string().regex(/^\d{6}$/, "Enter the six digit code"),
});

const VERIFY_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000 };

/**
 * Confirms an enrolment and turns two-factor authentication on.
 *
 * Every other device is signed out afterwards. The protection was only just
 * enabled, so any other session was created while it was off and cannot be
 * assumed to have passed the new check.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  const limit = await consumeRateLimit({ key: `2fa:confirm:${user.id}`, ...VERIFY_LIMIT });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the six digit code" }, { status: 422 });
  }

  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: "Two-factor authentication is already on" }, { status: 409 });
  }

  const record = await db.twoFactorCode.findFirst({
    where: { userId: user.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!evaluateTwoFactorCode(record).accepted || !record) {
    return NextResponse.json({ error: "That code is not right or has expired" }, { status: 400 });
  }

  const afterAttempt = await db.twoFactorCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  if (!(await verifyOneTimeCode(parsed.data.otpCode, afterAttempt.codeHash))) {
    if (afterAttempt.attempts >= ONE_TIME_CODE_MAX_ATTEMPTS) {
      await db.twoFactorCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    }
    return NextResponse.json({ error: "That code is not right or has expired" }, { status: 400 });
  }

  await db.$transaction(async (tx) => {
    await tx.twoFactorCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    await tx.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    await tx.loginSession.updateMany({ where: { userId: user.id }, data: { isActive: false } });
  });

  return NextResponse.json({ ok: true });
}