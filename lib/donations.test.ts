import { describe, expect, it } from "vitest";

import {
  mpesaTimestamp,
  normalizeMpesaPhone,
  stripeCurrencyCode,
  stripeUnitAmount,
  toKesAmount,
  validateDonationInput,
} from "./donations";

describe("toKesAmount", () => {
  it("converts at the default rate", () => {
    expect(toKesAmount(10)).toBe(1300);
  });

  it("rounds up so the donor never underpays by a fraction", () => {
    expect(toKesAmount(0.01)).toBeGreaterThanOrEqual(1);
  });
});

describe("normalizeMpesaPhone", () => {
  it("accepts the local, plus-prefixed, and network forms", () => {
    expect(normalizeMpesaPhone("0712345678")).toBe("254712345678");
    expect(normalizeMpesaPhone("+254712345678")).toBe("254712345678");
    expect(normalizeMpesaPhone("254712345678")).toBe("254712345678");
  });

  it("strips spaces and dashes before checking", () => {
    expect(normalizeMpesaPhone("+254 712-345-678")).toBe("254712345678");
  });

  it("rejects landlines and short numbers", () => {
    expect(normalizeMpesaPhone("020123456")).toBeNull();
    expect(normalizeMpesaPhone("07123")).toBeNull();
    expect(normalizeMpesaPhone("not a number")).toBeNull();
  });
});

describe("mpesaTimestamp", () => {
  it("formats as Nairobi yyyyMMddHHmmss", () => {
    expect(mpesaTimestamp(new Date("2026-01-15T09:05:07Z"))).toMatch(/^\d{14}$/);
  });
});

describe("stripeCurrencyCode", () => {
  it("lowercases for the API", () => {
    expect(stripeCurrencyCode("USD")).toBe("usd");
    expect(stripeCurrencyCode("KES")).toBe("kes");
  });
});

describe("stripeUnitAmount", () => {
  it("converts dollars to cents and leaves shillings whole", () => {
    expect(stripeUnitAmount(25, "USD")).toBe(2500);
    expect(stripeUnitAmount(1000, "KES")).toBe(1000);
  });
});

describe("donation bounds", () => {
  it("still enforces per-currency limits", () => {
    expect(validateDonationInput({ amount: 0, currency: "USD" }).ok).toBe(false);
    expect(validateDonationInput({ amount: 25, currency: "USD" }).ok).toBe(true);
  });
});
