/**
 * A single deadline rule, shared by every time-limited secret.
 *
 * Confirmation links, reset links and one-time codes all expire the same way, so
 * the comparison lives in one place rather than being restated in each caller
 * with a slightly different sign.
 *
 * The boundary is inclusive of the deadline: a secret is unusable from the
 * instant it is due, not one tick later.
 */
export function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}