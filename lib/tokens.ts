import { randomInt, randomBytes } from "node:crypto";

export const ONE_TIME_CODE_DIGITS = 6;
export const ONE_TIME_CODE_MIN = 0;
export const ONE_TIME_CODE_MAX = 10 ** ONE_TIME_CODE_DIGITS;

/**
 * Renders a numeric value as a fixed-width code.
 *
 * Separate from generation so the padding rule can be tested directly: a code
 * that loses its leading zero is a code a user cannot type back correctly.
 */
export function formatOneTimeCode(value: number): string {
  return value.toString().padStart(ONE_TIME_CODE_DIGITS, "0");
}

/**
 * Generates a URL-safe secret for a verification link or password reset.
 *
 * 32 bytes is the point where guessing stops being feasible; the value is only
 * ever stored as a hash, so it is transmitted once and not recoverable.
 */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Generates a numeric one-time code for two-factor authentication.
 *
 * Uses rejection sampling over `randomInt` rather than reducing a random byte
 * modulo the range, which would bias the low digits and make some codes more
 * likely than others.
 */
export function generateOneTimeCode(): string {
  return formatOneTimeCode(randomInt(ONE_TIME_CODE_MIN, ONE_TIME_CODE_MAX));
}

/** How long a one-time code stays usable. */
export const ONE_TIME_CODE_TTL_MS = 10 * 60 * 1000;

/**
 * How many times a single code may be submitted before it is discarded.
 *
 * A six-digit code has a million possible values, so the expiry window on its
 * own would still leave room for a few hundred thousand guesses. This bound
 * is what makes the code safe rather than merely inconvenient to attack.
 */
export const ONE_TIME_CODE_MAX_ATTEMPTS = 5;

/** How long an email verification or password reset token stays usable. */
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
