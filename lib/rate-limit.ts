import "server-only";

import { db } from "./db";

/**
 * Storage behind {@link consumeRateLimit}.
 *
 * Kept as an interface so the backing store is a separate concern from the
 * limit policy. Swapping the database for a dedicated cache is a new
 * implementation of this one shape, and no call site changes.
 */
export interface RateLimitStore {
  /** Records one attempt and returns how many have been made in this window. */
  increment(key: string, windowMs: number): Promise<number>;
  /** Discards the counter for a key, so the next attempt starts fresh. */
  reset(key: string): Promise<void>;
}

/**
 * Fixed-window counter kept in the database.
 *
 * The increment is issued as a conditional update rather than a read followed
 * by a write, so two simultaneous attempts cannot both read the same count and
 * each store the value they read. A request that finds no live row starts a new
 * window.
 */
export const databaseRateLimitStore: RateLimitStore = {
  async increment(key, windowMs) {
    const now = Date.now();
    const windowStartedAt = new Date(now - windowMs);

    const updated = await db.rateLimitBucket.updateMany({
      where: { key, windowStartedAt: { gt: windowStartedAt } },
      data: { count: { increment: 1 } },
    });

    if (updated.count > 0) {
      const row = await db.rateLimitBucket.findUniqueOrThrow({ where: { key } });
      return row.count;
    }

    await db.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, windowStartedAt: new Date(now), expiresAt: new Date(now + windowMs) },
      update: { count: 1, windowStartedAt: new Date(now), expiresAt: new Date(now + windowMs) },
    });

    return 1;
  },

  async reset(key) {
    await db.rateLimitBucket.deleteMany({ where: { key } });
  },
};

export interface RateLimitVerdict {
  allowed: boolean;
  /** Attempts left in the current window, for a Retry-After header. */
  remaining: number;
  /** Seconds until the window resets, or zero when the request was allowed. */
  retryAfterSeconds: number;
}

export interface RateLimitOptions {
  /**
   * Identifies what is being limited. Callers build this from the thing being
   * protected, such as `login:someone@example.com`, so that one user's failed
   * attempts do not lock out everyone else.
   */
  key: string;
  /** Attempts permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  store?: RateLimitStore;
}

/**
 * Records an attempt and reports whether it is permitted.
 *
 * A fixed window is used rather than a sliding one because it costs a single
 * write. Its known weakness is a burst spanning the boundary, which allows up
 * to twice the limit across two adjacent windows; that is an acceptable
 * property for throttling credential guessing, where the underlying password
 * and one-time code limits provide the harder bound.
 */
export async function consumeRateLimit({
  key,
  limit,
  windowMs,
  store = databaseRateLimitStore,
}: RateLimitOptions): Promise<RateLimitVerdict> {
  const count = await store.increment(key, windowMs);

  if (count <= limit) {
    return { allowed: true, remaining: limit - count, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
  };
}
