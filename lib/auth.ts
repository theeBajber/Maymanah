import "server-only";

import { headers } from "next/headers";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { mailer, oneTimeCodeEmailContent } from "@/lib/mailer";
import { hashOneTimeCode, verifyOneTimeCode, verifyPassword } from "@/lib/password";
import { consumeRateLimit } from "@/lib/rate-limit";
import { revokeLoginSession } from "@/lib/session";
import { evaluateTwoFactorCode } from "@/lib/two-factor";
import { generateOneTimeCode, ONE_TIME_CODE_MAX_ATTEMPTS, ONE_TIME_CODE_TTL_MS } from "@/lib/tokens";
import { loginSchema } from "@/lib/validation";

/** Raised when the password was correct but the sign-in is not complete. */
class TwoFactorRequiredError extends CredentialsSignin {
  code = "two_factor_required";
}

/** Sign-in attempts per email address. */
const LOGIN_EMAIL_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

/** Sign-in attempts per client address, so one host cannot spread guesses across accounts. */
const LOGIN_IP_LIMIT = { limit: 30, windowMs: 15 * 60 * 1000 };

/** Shortest gap between two codes sent to the same account. */
const TWO_FACTOR_SEND_LIMIT = { limit: 1, windowMs: 60 * 1000 };

/** Codes one account may receive in an hour. */
const TWO_FACTOR_SEND_HOURLY_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

/**
 * A well formed hash of a value nobody can supply, used when the address is not
 * registered.
 *
 * Without it, a request for an unknown address would skip the deliberately
 * expensive comparison and return faster than one for a real account, which
 * turns the sign-in form into a way to list which addresses have accounts. The
 * encoded portion is a fixed block of zero bytes, so it is well formed enough to
 * reach the comparison and never matches.
 */
const ABSENT_ACCOUNT_PASSWORD_HASH = [
  "scrypt",
  2 ** 14,
  8,
  1,
  Buffer.alloc(16).toString("base64url"),
  Buffer.alloc(64).toString("base64url"),
].join("$");

interface CredentialUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  twoFactorEnabled: boolean;
}

async function clientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown"
  );
}

/**
 * Issues a code and sends it.
 *
 * Sending is limited per account. Without that limit, every sign-in attempt
 * without a code would produce a new message, so anyone able to submit a
 * password could fill a victim's inbox for free.
 */
async function sendTwoFactorCode(userId: string, email: string, name: string) {
  const [recent, hourly] = await Promise.all([
    consumeRateLimit({ key: `2fa:send:${userId}`, ...TWO_FACTOR_SEND_LIMIT }),
    consumeRateLimit({ key: `2fa:send:hour:${userId}`, ...TWO_FACTOR_SEND_HOURLY_LIMIT }),
  ]);

  // Withholding silently, so the response does not reveal that a code was held back.
  if (!recent.allowed || !hourly.allowed) return;

  // Retires codes issued earlier, so only the newest is ever accepted.
  await db.twoFactorCode.updateMany({ where: { userId, consumedAt: null }, data: { consumedAt: new Date() } });

  const code = generateOneTimeCode();

  await db.twoFactorCode.create({
    data: {
      userId,
      codeHash: await hashOneTimeCode(code),
      expiresAt: new Date(Date.now() + ONE_TIME_CODE_TTL_MS),
    },
  });

  await mailer.send({ to: email, ...oneTimeCodeEmailContent(name, code) });
}

/**
 * Completes the second factor, or reports that it cannot.
 *
 * Returns true only when a submitted code was correct. Every other path throws
 * the same error, so a caller cannot distinguish a wrong code from an expired
 * one from a missing one.
 */
async function completeTwoFactor(user: CredentialUser, submitted: string | undefined): Promise<boolean> {
  if (!submitted) {
    await sendTwoFactorCode(user.id, user.email, user.name);
    throw new TwoFactorRequiredError();
  }

  const record = await db.twoFactorCode.findFirst({
    where: { userId: user.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, codeHash: true, attempts: true, expiresAt: true, consumedAt: true },
  });

  if (!evaluateTwoFactorCode(record).accepted) {
    // A code that exists but cannot be used is retired, so it cannot be probed
    // repeatedly to learn when it becomes usable again.
    if (record && !record.consumedAt) {
      await db.twoFactorCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    }
    throw new TwoFactorRequiredError();
  }

  // Counted before the comparison, so a run of guesses stays bounded even when
  // each one reaches it.
  const afterAttempt = await db.twoFactorCode.update({
    where: { id: record!.id },
    data: { attempts: { increment: 1 } },
    select: { attempts: true, codeHash: true },
  });

  const matches = await verifyOneTimeCode(submitted, afterAttempt.codeHash);

  const exhausted = afterAttempt.attempts >= ONE_TIME_CODE_MAX_ATTEMPTS;

  if (matches) {
    await db.twoFactorCode.update({ where: { id: record!.id }, data: { consumedAt: new Date() } });
    return true;
  }

  // The final permitted attempt has now been spent, so the code is retired
  // rather than left in place until it expires on its own.
  if (exhausted) {
    await db.twoFactorCode.update({ where: { id: record!.id }, data: { consumedAt: new Date() } });
  }

  throw new TwoFactorRequiredError();
}

async function openLoginSession(user: CredentialUser) {
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "unknown device";
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";

  const loginSession = await db.loginSession.create({
    data: {
      userId: user.id,
      deviceName: userAgent.slice(0, 255),
      ipAddress: forwarded.slice(0, 64),
    },
    select: { id: true },
  });

  return loginSession.id;
}

const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  events: {
    /**
     * Ends the device that signed out.
     *
     * The cookie is self-contained, so clearing it in the browser is not enough
     * to stop the session being presented again. Marking the device record
     * inactive means the next request that carries that cookie is refused.
     */
    async signOut(message) {
      const loginSessionId = (message as { token?: { loginSessionId?: string } }).token?.loginSessionId;
      if (!loginSessionId) return;
      await revokeLoginSession(loginSessionId);
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Two-factor code", type: "text" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);

        // A malformed submission is treated exactly like a wrong password, so the
        // two cannot be told apart from the outside.
        if (!parsed.success) return null;
        const { email, password, code } = parsed.data;

        const [byEmail, byIp] = await Promise.all([
          consumeRateLimit({ key: `login:email:${email}`, ...LOGIN_EMAIL_LIMIT }),
          consumeRateLimit({ key: `login:ip:${await clientIp()}`, ...LOGIN_IP_LIMIT }),
        ]);

        if (!byEmail.allowed || !byIp.allowed) return null;

        const found = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, passwordHash: true, role: true, gender: true, twoFactorEnabled: true },
        });

        // Compared even when no account matched, so the time taken does not
        // reveal whether the address is registered.
        const matches = await verifyPassword(password, found?.passwordHash ?? ABSENT_ACCOUNT_PASSWORD_HASH);

        if (!found || !matches) return null;

        if (found.twoFactorEnabled && !(await completeTwoFactor(found, code))) return null;

        return {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
          gender: found.gender ?? undefined,
          loginSessionId: await openLoginSession(found),
        };
      },
    }),
  ],
});

export { handlers, auth, signIn, signOut };