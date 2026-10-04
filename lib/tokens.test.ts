import { describe, expect, it } from "vitest";

import {
  formatOneTimeCode,
  generateOneTimeCode,
  generateToken,
  ONE_TIME_CODE_DIGITS,
  ONE_TIME_CODE_MAX_ATTEMPTS,
} from "./tokens";

describe("generateToken", () => {
  it("is url safe, so it can be placed in a link without escaping", () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateToken()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("does not repeat", () => {
    const tokens = new Set(Array.from({ length: 200 }, generateToken));

    expect(tokens.size).toBe(200);
  });
});

describe("formatOneTimeCode", () => {
  it("pads a low value so its leading zero is not lost", () => {
    expect(formatOneTimeCode(0)).toBe("000000");
    expect(formatOneTimeCode(42)).toBe("000042");
  });

  it("leaves a full width value alone", () => {
    expect(formatOneTimeCode(999_999)).toBe("999999");
  });
});

describe("generateOneTimeCode", () => {
  it("is always the same width, including when it starts with zero", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateOneTimeCode()).toHaveLength(ONE_TIME_CODE_DIGITS);
    }
  });

  it("contains only digits", () => {
    for (let i = 0; i < 100; i += 1) {
      expect(generateOneTimeCode()).toMatch(/^[0-9]{6}$/);
    }
  });

  it("stays within the six digit range", () => {
    for (let i = 0; i < 200; i += 1) {
      const value = Number(generateOneTimeCode());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(999_999);
    }
  });

  it("does not repeat across many draws", () => {
    const codes = new Set(Array.from({ length: 1000 }, generateOneTimeCode));

    expect(codes.size).toBeGreaterThan(990);
  });
});

describe("limits", () => {
  it("bounds guessing of a six digit code by attempts, not only by expiry", () => {
    expect(ONE_TIME_CODE_MAX_ATTEMPTS).toBeLessThanOrEqual(5);
  });
});
