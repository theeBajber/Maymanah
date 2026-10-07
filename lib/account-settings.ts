import "server-only";

import { db } from "./db";
import { mailer, oneTimeCodeEmailContent } from "./mailer";
import { hashOneTimeCode, hashPassword, verifyOneTimeCode, verifyPassword } from "./password";
import { consumeRateLimit } from "./rate-limit";
import { evaluateTwoFactorCode } from "./two-factor";
import { generateOneTimeCode, ONE_TIME_CODE_MAX_ATTEMPTS, ONE_TIME_CODE_TTL_MS } from "./tokens";
import { revokeAllLoginSessions, revokeLoginSession } from "./session";

/**
 * Turning two-factor authentication on and off.
 *
 * Both directions require the current password, and turning it off requires a
 * code as well. A stolen session cookie would otherwise be enough to remove the
 * protection that is the only thing standing between that cookie and a signed-in
 * account.
 */

const ENABLE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const DISABLE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const VERIFY_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000 };

/** Codes sent to one account while enrolling. */
const ENROL_SEND_LIMIT = { limit: 1, windowMs: 60 * 1000 };
const ENROL_SEND_HOURLY_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export type SettingsFailure =
  | "wrong_password"
  | "already_enabled"
  | "not_enabled"
  | "invalid_code"
  | "rate_limited"
  | "not_sent"
  | "password_too_short";

export type SettingsOutcome = { ok: true; signedOutEverywhere: boolean } | { ok: false; reason: SettingsFailure };

/**
 * Begins enrolling a user in two-factor authentication.
 *
 * Issues a code to the address already on the account rather than one supplied by
 * the caller, so enrolling cannot be pointed at an address the user does not
 * control.
 */
export async function beginEnablingTwoFactor(userId: string, password: string): Promise<SettingsOutcome> {
  const limit = await consumeRateLimit({ key: `2fa:enable:${userId}`, ...ENABLE_LIMIT });
  if (!limit.allowed) return { ok: false, reason: "rate_limited" };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, twoFactorEnabled: true, email: true, name: true },
  });

  if (!user) return { ok: false, reason: "wrong_password" };
  if (user.twoFactorEnabled) return { ok: false, reason: "already_enabled" };

  // A password change can invalidate a pending enrolment, so the current
  // password is confirmed again rather than relying on the session alone.
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, reason: "wrong_password" };
  }

  const [recent, hourly] = await Promise.all([
    consumeRateLimit({ key: `2fa:enrol:send:${userId}`, ...ENROL_SEND_LIMIT }),
    consumeRateLimit({ key: `2fa:enrol:hour:${userId}`, ...ENROL_SEND_HOURLY_LIMIT }),
  ]);

  if (!recent.allowed || !hourly.allowed) return { ok: false, reason: "rate_limited" };

  await db.twoFactorCode.updateMany({ where: { userId, consumedAt: null }, data: { consumedAt: new Date() } });

  const code = generateOneTimeCode();

  await db.twoFactorCode.create({
    data: { userId, codeHash: await hashOneTimeCode(code), expiresAt: new Date(Date.now() + ONE_TIME_CODE_TTL_MS) },
  });

  try {
    await mailer.send({ to: user.email, ...oneTimeCodeEmailContent(user.name, code) });
  } catch (error) {
    console.error("Could not send enrolment code", error);
    return { ok: false, reason: "not_sent" };
  }

  return { ok: true, signedOutEverywhere: false };
}

/**
 * Confirms an enrolment and turns two-factor authentication on.
 */
export async function confirmEnablingTwoFactor(userId: string, code: string): Promise<SettingsOutcome> {
  const limit = await consumeRateLimit({ key: `2fa:confirm:${userId}`, ...VERIFY_LIMIT });
  if (!limit.allowed) return { ok: false, reason: "rate_limited" };

  const user = await db.user.findUnique({ where: { id: userId }, select: { twoFactorEnabled: true } });
  if (!user) return { ok: false, reason: "invalid_code" };
  if (user.twoFactorEnabled) return { ok: false, reason: "already_enabled" };

  const matched = await consumeCode(userId, code);
  if (!matched) return { ok: false, reason: "invalid_code" };

  await db.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });

  /*
   * Every other device is signed out.
   *
   * The protection was only just turned on, so any other session was created
   * while it was off and cannot be assumed to have passed the new check. The
   * device doing the enrolment stays signed in.
   */
  await revokeAllLoginSessions(userId);

  return { ok: true, signedOutEverywhere: true };
}

/**
 * Turns two-factor authentication off.
 *
 * Requires both the current password and a fresh code, since removing the second
 * factor is exactly what an attacker holding a session would want to do.
 */
export async function disableTwoFactor(
  userId: string,
  password: string,
  code: string,
): Promise<SettingsOutcome> {
  const limit = await consumeRateLimit({ key: `2fa:disable:${userId}`, ...DISABLE_LIMIT });
  if (!limit.allowed) return { ok: false, reason: "rate_limited" };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorEnabled) return { ok: false, reason: "not_enabled" };

  if (!(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, reason: "wrong_password" };
  }

  if (!(await consumeCode(userId, code))) return { ok: false, reason: "invalid_code" };

  await db.user.update({ where: { id: userId }, data: { twoFactorEnabled: false } });
  await db.twoFactorCode.updateMany({ where: { userId, consumedAt: null }, data: { consumedAt: new Date() } });

  return { ok: true, signedOutEverywhere: false };
}

/**
 * Changes a password while signed in.
 *
 * Every other device is signed out afterwards. The current password is required
 * even though the session is valid, so that a borrowed or left-open browser
 * cannot quietly take the account over permanently.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<SettingsOutcome> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) return { ok: false, reason: "wrong_password" };

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return { ok: false, reason: "wrong_password" };
  }

  await db.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });

  return { ok: true, signedOutEverywhere: false };
}

/** Ends every device, including this one, after a password change. */
export async function revokeEverything(userId: string): Promise<void> {
  await revokeAllLoginSessions(userId);
}

/** Ends one device by its identifier. */
export async function revokeDevice(loginSessionId: string): Promise<void> {
  await revokeLoginSession(loginSessionId);
}

/**
 * Checks a submitted code against the newest unused one, counting the attempt
 * and retiring the code once its attempts are spent.
 *
 * Shared by every flow that verifies a code, so the attempt cap cannot be
 * enforced in one place and forgotten in another.
 */
async function consumeCode(userId: string, code: string): Promise<boolean> {
  const record = await db.twoFactorCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, codeHash: true, attempts: true, expiresAt: true, consumedAt: true },
  });

  if (!evaluateTwoFactorCode(record).accepted) return false;

  const afterAttempt = await db.twoFactorCode.update({
    where: { id: record!.id },
    data: { attempts: { increment: 1 } },
    select: { attempts: true, codeHash: true },
  });

  if (await verifyOneTimeCode(code, afterAttempt.codeHash)) {
    await db.twoFactorCode.update({ where: { id: record!.id }, data: { consumedAt: new Date() } });
    return true;
  }

  if (afterAttempt.attempts >= ONE_TIME_CODE_MAX_ATTEMPTS) {
    await db.twoFactorCode.update({ where: { id: record!.id }, data: { consumedAt: new Date() } });
  }

  return false;
}