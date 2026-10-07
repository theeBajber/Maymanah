import { NextResponse } from "next/server";

import { DONATION_LIMITS, type DonationCurrency } from "@/lib/donations";

/**
 * What a donation endpoint answers before its provider is connected.
 *
 * Each provider route validates the request first and reports bad input
 * exactly as it will once connected, so the form's error handling is exercised
 * against the real contract rather than against a stub that accepts anything.
 * Only the final step — talking to the provider — is missing, and that is
 * reported plainly rather than faked.
 */

const PROVIDER_MESSAGE =
  "Donations through this provider are not connected yet. Please try again later, or contact us to give another way.";

export function readDonationBody(body: unknown): { amount?: unknown; currency?: unknown } {
  return ((body ?? {}) as { amount?: unknown; currency?: unknown });
}

export function validateDonationInput(body: unknown):
  | { ok: true; amount: number; currency: DonationCurrency }
  | { ok: false; error: string } {
  const { amount, currency } = readDonationBody(body);

  if (currency !== "USD" && currency !== "KES") {
    return { ok: false, error: "Choose a supported currency." };
  }

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { ok: false, error: "Enter an amount to donate." };
  }

  const limits = DONATION_LIMITS[currency];

  if (amount < limits.min || amount > limits.max) {
    return { ok: false, error: `Donations must be between ${limits.min} and ${limits.max} ${currency}.` };
  }

  return { ok: true, amount, currency };
}

export function providerUnavailable(): NextResponse {
  return NextResponse.json({ error: PROVIDER_MESSAGE }, { status: 503 });
}
