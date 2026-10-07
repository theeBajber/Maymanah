import { describe, expect, it } from "vitest";

import { validateDonationInput } from "./unavailable";

describe("validateDonationInput", () => {
  it("accepts a well formed request", () => {
    expect(validateDonationInput({ amount: 25, currency: "USD" })).toEqual({
      ok: true,
      amount: 25,
      currency: "USD",
    });
  });

  it("rejects an unknown currency, so a typo cannot slip through as a default", () => {
    const result = validateDonationInput({ amount: 25, currency: "EUR" });

    expect(result.ok).toBe(false);
  });

  it("rejects a missing amount without throwing", () => {
    expect(validateDonationInput({ currency: "USD" }).ok).toBe(false);
  });

  it("rejects a non-numeric amount", () => {
    expect(validateDonationInput({ amount: "25", currency: "USD" }).ok).toBe(false);
    expect(validateDonationInput({ amount: Number.NaN, currency: "USD" }).ok).toBe(false);
  });

  it("enforces the per-currency bounds", () => {
    expect(validateDonationInput({ amount: 0, currency: "USD" }).ok).toBe(false);
    expect(validateDonationInput({ amount: 10_001, currency: "USD" }).ok).toBe(false);
    expect(validateDonationInput({ amount: 500, currency: "KES" }).ok).toBe(true);
  });

  it("names the bounds in the refusal, so the form can show them", () => {
    const result = validateDonationInput({ amount: 0, currency: "KES" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("KES");
  });
});
