import "server-only";

import { db } from "./db";
import { mailer, oneTimeCodeEmailContent } from "./mailer";
import { hashOneTimeCode } from "./password";
import { consumeRateLimit } from "./rate-limit";
import { getCurrentUser, type SessionLike } from "./session";
import { generateOneTimeCode, ONE_TIME_CODE_TTL_MS } from "./tokens";

/**
 * Two-factor enrolment through the settings page.
 *
 * Separate from the sign-in code path, which also issues and checks codes but
 * answers a different question: signing in asks whether this attempt may
 * proceed, while these functions ask whether the protection itself should be
 * turned on or off. Sharing the attempt-cap logic keeps the two from drifting
 * apart; sharing the endpoints would conflate them.
 */

const SEND_LIMIT = { limit: 1, windowMs: 60 * 1000 };
const SEND_HOURLY_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const ACTION_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000 };

export type EnrolFailure = "already_enabled" | "not_enabled" | "rate_limited" | "not_sent" | "invalid_code";

/** Issues an enrolment code to the address already on the account. */
export async function sendEnrolmentCode(
  session: SessionLike | null,
): Promise<{ ok: true } | { ok: false; reason: Extract<EnrolFailure, "rate_limited" | "already_enabled" | "not_sent"> }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("sendEnrolmentCode requires a signed-in user");
  if (user.twoFactorEnabled) return { ok: false, reason: "already_enabled" };

  const [recent, hourly] = await Promise.all([
    consumeRateLimit({ key: `2fa:enrol:send:${user.id}`, ...SEND_LIMIT }),
    consumeRateLimit({ key: `2fa:enrol:hour:${user.id}`, ...SEND_HOURLY_LIMIT }),
  ]);
  if (!recent.allowed || !hourly.allowed) return { ok: false, reason: "rate_limited" };

  await db.twoFactorCode.updateMany({ where: { userId: user.id, consumedAt: null }, data: { consumedAt: new Date() } });

  const code = generateOneTimeCode();
  await db.twoFactorCode.create({
    data: { userId: user.id, codeHash: await hashOneTimeCode(code), expiresAt: new Date(Date.now() + ONE_TIME_CODE_TTL_MS) },
  });

  try {
    const full = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { email: true, name: true } });
    await mailer.send({ to: full.email, ...oneTimeCodeEmailContent(full.name, code) });
  } catch (error) {
    console.error("Could not send enrolment code", error);
    return { ok: false, reason: "not_sent" };
  }

  return { ok: true };
}

export async function limited(
  key: string,
): Promise<boolean> {
  const verdict = await consumeRateLimit({ key, ...ACTION_LIMIT });
  return verdict.allowed;
}
