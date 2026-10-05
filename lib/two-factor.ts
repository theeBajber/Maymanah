import { ONE_TIME_CODE_MAX_ATTEMPTS } from "./tokens";

/**
 * The stored half of a one-time code, reduced to the fields a decision needs.
 */
export interface TwoFactorCodeRecord {
  id: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
}

export type TwoFactorRejection = "no_code" | "consumed" | "expired" | "attempts_exhausted";

export type TwoFactorDecision = { accepted: true } | { accepted: false; reason: TwoFactorRejection };

/**
 * Decides whether a submitted code may still be checked.
 *
 * The attempt count is the reason this exists as a separate step. A six-digit
 * code has a million possible values, and an expiry window alone still leaves
 * room for a great many guesses. Once the cap is reached the code is dead
 * regardless of how much time is left, so guessing is bounded by the number of
 * submissions rather than by the clock.
 *
 * The cap is checked before the code is compared, so an exhausted code costs no
 * further hashing.
 */
export function evaluateTwoFactorCode(record: TwoFactorCodeRecord | null, now: Date = new Date()): TwoFactorDecision {
  if (!record) return { accepted: false, reason: "no_code" };
  if (record.consumedAt) return { accepted: false, reason: "consumed" };
  if (record.expiresAt.getTime() <= now.getTime()) return { accepted: false, reason: "expired" };
  if (record.attempts >= ONE_TIME_CODE_MAX_ATTEMPTS) return { accepted: false, reason: "attempts_exhausted" };

  return { accepted: true };
}

/** True once the code has used up its attempts and must not be compared again. */
export function isExhausted(record: TwoFactorCodeRecord): boolean {
  return record.attempts >= ONE_TIME_CODE_MAX_ATTEMPTS;
}