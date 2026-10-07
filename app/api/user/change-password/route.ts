import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getCurrentUser } from "@/lib/session";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(200),
  confirmPassword: z.string().optional(),
});

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Changes a password from settings.
 *
 * Accepts the confirmation the form sends and checks it matches, so a
 * mistyped new password is caught before anything is stored rather than
 * locking the person out with a password they never intended.
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

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the fields" }, { status: 422 });
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (confirmPassword !== undefined && confirmPassword !== newPassword) {
    return NextResponse.json({ error: "The two passwords do not match" }, { status: 422 });
  }

  const stored = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!stored || !(await verifyPassword(currentPassword, stored.passwordHash))) {
    return NextResponse.json({ error: "That password is not correct" }, { status: 401 });
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
    // Every device is signed out on the assumption that a changed password
    // means the account is no longer trusted as it was.
    await tx.loginSession.updateMany({ where: { userId: user.id }, data: { isActive: false } });
  });

  return NextResponse.json({ ok: true });
}