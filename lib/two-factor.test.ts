import { describe, expect, it } from "vitest";

import { evaluateTwoFactorCode, isExhausted, type TwoFactorCodeRecord } from "./two-factor";
import { ONE_TIME_CODE_MAX_ATTEMPTS } from "./tokens";

const NOW = new Date("2026-01-01T12:00:00Z");

function record(overrides: Partial<TwoFactorCodeRecord> = {}): TwoFactorCodeRecord {
  return {
    id: "code-1",
    codeHash: "scrypt$16384$8$1$salt$hash",
    attempts: 0,
    expiresAt: new Date(NOW.getTime() + 60_000),
    consumedAt: null,
    ...overrides,
  };
}

describe("evaluateTwoFactorCode", () => {
  it("accepts a fresh code", () => {
    expect(evaluateTwoFactorCode(record(), NOW)).toEqual({ accepted: true });
  });

  it("rejects when no code was ever issued", () => {
    expect(evaluateTwoFactorCode(null, NOW)).toEqual({ accepted: false, reason: "no_code" });
  });

  it("rejects an already used code, so a captured code cannot be replayed", () => {
    const used = record({ consumedAt: new Date(NOW.getTime() - 1000) });

    expect(evaluateTwoFactorCode(used, NOW)).toEqual({ accepted: false, reason: "consumed" });
  });

  it("rejects at the moment of expiry, not before it", () => {
    expect(evaluateTwoFactorCode(record({ expiresAt: NOW }), NOW)).toEqual({ accepted: false, reason: "expired" });
  });

  it("still accepts one millisecond before expiry", () => {
    const almost = record({ expiresAt: new Date(NOW.getTime() + 1) });

    expect(evaluateTwoFactorCode(almost, NOW)).toEqual({ accepted: true });
  });

  it("accepts the final permitted attempt", () => {
    const last = record({ attempts: ONE_TIME_CODE_MAX_ATTEMPTS - 1 });

    expect(evaluateTwoFactorCode(last, NOW)).toEqual({ accepted: true });
  });

  it("rejects once the attempt cap is reached", () => {
    const spent = record({ attempts: ONE_TIME_CODE_MAX_ATTEMPTS });

    expect(evaluateTwoFactorCode(spent, NOW)).toEqual({ accepted: false, reason: "attempts_exhausted" });
  });

  it("bounds guessing by submissions rather than by the expiry window", () => {
    // Ten minutes is a long time to hold a six digit code.
    const longLived = record({ expiresAt: new Date(NOW.getTime() + 10 * 60_000), attempts: ONE_TIME_CODE_MAX_ATTEMPTS });

    expect(evaluateTwoFactorCode(longLived, NOW).accepted).toBe(false);
  });
});

describe("isExhausted", () => {
  it("is false while attempts remain", () => {
    expect(isExhausted(record({ attempts: 0 }))).toBe(false);
  });

  it("is true at the cap", () => {
    expect(isExhausted(record({ attempts: ONE_TIME_CODE_MAX_ATTEMPTS }))).toBe(true);
  });

  it("is true beyond the cap", () => {
    expect(isExhausted(record({ attempts: ONE_TIME_CODE_MAX_ATTEMPTS + 10 }))).toBe(true);
  });
});