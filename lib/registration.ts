import "server-only";

import { db } from "./db";
import { mailer, verificationEmailContent, verificationLink } from "./mailer";
import { hashPassword, hashToken } from "./password";
import { consumeRateLimit } from "./rate-limit";
import { generateToken, VERIFICATION_TOKEN_TTL_MS } from "./tokens";
import type { RegisterInput } from "./validation";

/** Registration attempts allowed per client address in a fifteen minute window. */
const REGISTRATION_IP_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

/** Attempts allowed against a single address, so one target cannot be flooded or enumerated. */
const REGISTRATION_EMAIL_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export type RegistrationFailure = "rate_limited" | "email_taken";

export type RegistrationOutcome = { ok: true; userId: string } | { ok: false; reason: RegistrationFailure };

/**
 * Creates an account and sends its confirmation message.
 *
 * The account starts unverified, and sign-in is permitted in that state with a
 * prompt to confirm. Refusing access outright makes a mistyped address look
 * like a broken product, and is the usual reason people abandon sign-up. The
 * features that genuinely need a confirmed address check it themselves.
 *
 * The confirmation token is stored against the address rather than the account,
 * because it has to be verifiable before an account exists.
 */
export async function registerUser(input: RegisterInput, clientIp: string): Promise<RegistrationOutcome> {
  const byIp = await consumeRateLimit({ key: `register:ip:${clientIp}`, ...REGISTRATION_IP_LIMIT });
  if (!byIp.allowed) return { ok: false, reason: "rate_limited" };

  const byEmail = await consumeRateLimit({ key: `register:email:${input.email}`, ...REGISTRATION_EMAIL_LIMIT });
  if (!byEmail.allowed) return { ok: false, reason: "rate_limited" };

  if (await db.user.findUnique({ where: { email: input.email }, select: { id: true } })) {
    return { ok: false, reason: "email_taken" };
  }

  const token = generateToken();
  const passwordHash = await hashPassword(input.password);
  const tokenHash = await hashToken(token);

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: input.name, email: input.email, passwordHash, role: input.role },
      select: { id: true },
    });

    await tx.verificationToken.create({
      data: {
        email: input.email,
        tokenHash,
        purpose: "EMAIL_VERIFICATION",
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      },
    });

    return created;
  });

  try {
    await mailer.send({ to: input.email, ...verificationEmailContent(input.name, verificationLink(token)) });
  } catch (error) {
    // The account is created either way. Reporting a failure here would tell a
    // caller that no account exists when one does, and the recipient can ask
    // for another confirmation.
    console.error("Could not send address confirmation", error);
  }

  return { ok: true, userId: user.id };
}
