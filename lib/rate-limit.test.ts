import { describe, expect, it } from "vitest";

import { consumeRateLimit, type RateLimitStore } from "./rate-limit";

/**
 * Stands in for the database so the policy can be tested on its own. Counts and
 * window boundaries are held in memory, which is what the real store persists.
 */
function memoryStore(): RateLimitStore & { counts: Map<string, number> } {
  const counts = new Map<string, number>();
  return {
    counts,
    async increment(key) {
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return next;
    },
    async reset(key) {
      counts.delete(key);
    },
  };
}

describe("consumeRateLimit", () => {
  it("allows attempts up to the limit", async () => {
    const store = memoryStore();

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const verdict = await consumeRateLimit({ key: "login:a@example.com", limit: 3, windowMs: 60_000, store });
      expect(verdict.allowed).toBe(true);
      expect(verdict.remaining).toBe(3 - attempt);
    }
  });

  it("refuses the attempt past the limit", async () => {
    const store = memoryStore();
    const options = { key: "login:a@example.com", limit: 2, windowMs: 60_000, store };

    await consumeRateLimit(options);
    await consumeRateLimit(options);
    const third = await consumeRateLimit(options);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("tells the caller how long to wait, so the response can say so", async () => {
    const store = memoryStore();
    const options = { key: "login:a@example.com", limit: 1, windowMs: 90_000, store };

    await consumeRateLimit(options);
    const denied = await consumeRateLimit(options);

    expect(denied.retryAfterSeconds).toBe(90);
  });

  it("rounds a partial window up, never down to zero", async () => {
    const store = memoryStore();
    const options = { key: "login:a@example.com", limit: 1, windowMs: 1_500, store };

    await consumeRateLimit(options);

    expect((await consumeRateLimit(options)).retryAfterSeconds).toBe(2);
  });

  it("keeps one subject's attempts from blocking another", async () => {
    const store = memoryStore();

    for (let i = 0; i < 3; i += 1) {
      await consumeRateLimit({ key: "login:a@example.com", limit: 2, windowMs: 60_000, store });
    }

    const other = await consumeRateLimit({ key: "login:b@example.com", limit: 2, windowMs: 60_000, store });

    expect(other.allowed).toBe(true);
  });

  it("starts a fresh window after a reset", async () => {
    const store = memoryStore();
    const options = { key: "login:a@example.com", limit: 1, windowMs: 60_000, store };

    await consumeRateLimit(options);
    expect((await consumeRateLimit(options)).allowed).toBe(false);

    await store.reset(options.key);

    expect((await consumeRateLimit(options)).allowed).toBe(true);
  });

  it("stays refused while the attempt count keeps climbing", async () => {
    const store = memoryStore();
    const options = { key: "login:a@example.com", limit: 1, windowMs: 60_000, store };

    await consumeRateLimit(options);

    for (let i = 0; i < 5; i += 1) {
      expect((await consumeRateLimit(options)).allowed).toBe(false);
    }
  });
});
