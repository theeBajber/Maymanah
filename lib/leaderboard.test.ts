import { describe, expect, it } from "vitest";

import { clampPercent } from "@/app/ui/cards";

describe("clampPercent", () => {
  it("passes ordinary values through rounded", () => {
    expect(clampPercent(42.4)).toBe(42);
    expect(clampPercent(42.5)).toBe(43);
  });

  it("clamps below zero and above a hundred, so a width style cannot break", () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(140)).toBe(100);
  });

  it("treats non-numbers as zero rather than rendering nothing", () => {
    expect(clampPercent(Number.NaN)).toBe(0);
    expect(clampPercent(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
