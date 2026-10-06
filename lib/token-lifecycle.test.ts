import { describe, expect, it } from "vitest";

import { isExpired } from "./token-lifecycle";

describe("isExpired", () => {
  const now = new Date("2026-03-01T12:00:00Z");

  it("is not expired well before the deadline", () => {
    expect(isExpired(new Date("2026-03-02T00:00:00Z"), now)).toBe(false);
  });

  it("is expired once the deadline has passed", () => {
    expect(isExpired(new Date("2026-02-28T00:00:00Z"), now)).toBe(true);
  });

  it("is expired exactly at the deadline, not a moment before", () => {
    expect(isExpired(now, now)).toBe(true);
  });

  it("is still valid one millisecond before the deadline", () => {
    expect(isExpired(new Date(now.getTime() + 1), now)).toBe(false);
  });
});