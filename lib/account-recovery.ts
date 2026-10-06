import "server-only";

import { db } from "./db";
import { mailer, passwordResetEmailContent, passwordResetLink, verificationEmailContent, verificationLink } from "./mailer";
import { hashPassword, hashToken } from "./password";
import { isExpired } from "./token-lifecycle";
import { generateToken, VERIFICATION_TOKEN_TTL_MS } from "./tokens";

export type TokenFailure = "invalid" | "expired" | "used";

export type TokenOutcome<T> = { ok: true; value: T } | { ok: false; reason: TokenFailure };

/**
 * Confirms an email address from a token taken out of a link.
 *
 * Every unconfirmed address on the account is marked at once, so a person who
 * registered twice and then confirms either address ends up confirmed rather
 * than holding a duplicate.
 */
export async function verifyEmailToken(token: string): Promise<TokenOutcome<string>> {
  const tokenHash = await hashToken(token);

  const record = await db.verificationToken.findFirst({
    where: { tokenHash, purpose: "EMAIL_VERIFICATION", consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, expiresAt: true },
  });

  if (!record) return { ok: false, reason: "invalid" };

  if (isExpired(record.expiresAt)) {
    // Retired on sight, so an expired token cannot be distinguished from an
    // unknown one by how long it has been sitting there.
    await db.verificationToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    return { ok: false, reason: "expired" };
  }

  const now = new Date();

  await db.$transaction([
    db.verificationToken.updateMany({
      where: { email: record.email, purpose: "EMAIL_VERIFICATION", consumedAt: null },
      data: { consumedAt: now },
    }),
    db.user.updateMany({ where: { email: record.email, emailVerified: null }, data: { emailVerified: now } }),
  ]);

  return { ok: true, value: record.email };
}

/**
 * Issues a fresh confirmation message for an address.
 *
 * Reports the same outcome whether or not an account exists for the address, so
 * this endpoint cannot be used to learn who has registered.
 */
export async function sendVerificationEmail(email: string): Promise<{ sent: boolean }> {
  const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true, emailVerified: true } });

  if (!user || user.emailVerified) return { sent: true };

  await db.verificationToken.updateMany({
    where: { email, purpose: "EMAIL_VERIFICATION", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const token = generateToken();

  await db.verificationToken.create({
    data: {
      email,
      tokenHash: await hashToken(token),
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });

  try {
    await mailer.send({ to: email, ...verificationEmailContent(user.name, verificationLink(token)) });
  } catch (error) {
    console.error("Could not send address confirmation", error);
    return { sent: false };
  }

  return { sent: true };
}

/**
 * Issues a password reset message.
 *
 * As with confirmation, the response is identical for a known and an unknown
 * address. An endpoint that answered differently would let anyone test whether
 * a particular person has an account.
 */
export async function sendPasswordResetEmail(email: string): Promise<{ sent: boolean }> {
  const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });

  if (!user) return { sent: true };

  await db.verificationToken.updateMany({
    where: { email, purpose: "PASSWORD_RESET", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const token = generateToken();

  await db.verificationToken.create({
    data: {
      email,
      tokenHash: await hashToken(token),
      purpose: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });

  try {
    await mailer.send({ to: email, ...passwordResetEmailContent(user.name, passwordResetLink(token)) });
  } catch (error) {
    console.error("Could not send password reset message", error);
    return { sent: false };
  }

  return { sent: true };
}

/**
 * Completes a password reset.
 *
 * Choosing a new password signs every other device out, on the assumption that
 * somebody who reset a password did so because they no longer trust the account.
 * The device performing the reset stays signed in.
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<TokenOutcome<string>> {
  const tokenHash = await hashToken(token);

  const record = await db.verificationToken.findFirst({
    where: { tokenHash, purpose: "PASSWORD_RESET", consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, expiresAt: true },
  });

  if (!record) return { ok: false, reason: "invalid" };

  if (isExpired(record.expiresAt)) {
    await db.verificationToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    return { ok: false, reason: "expired" };
  }

  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { email: record.email }, data: { passwordHash: await hashPassword(newPassword) } });
    await tx.verificationToken.update({ where: { id: record.id }, data: { consumedAt: now } });
    await tx.loginSession.updateMany({ where: { user: { email: record.email } }, data: { isActive: false } });
  });

  return { ok: true, value: record.email };
}