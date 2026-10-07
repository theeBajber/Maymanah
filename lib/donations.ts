/**
 * Donation amounts and bounds, independent of any payment provider.
 *
 * Only the presentation-facing values live here: what the preset buttons offer,
 * and the range a contribution must fall within. Talking to a payment provider
 * is a separate concern that arrives with the provider itself, so nothing in
 * this file knows that Stripe, M-Pesa, or Pesapal exist.
 */

/** Preset amounts offered in the interface, in each supported currency. */
export const USD_PRESETS = [5, 10, 25] as const;
export const KES_PRESETS = [500, 1000, 2500] as const;

/**
 * The range a contribution must fall within.
 *
 * A minimum keeps a provider's fixed fee from swallowing a very small donation,
 * and a maximum keeps one transaction from exceeding what the provider accepts.
 */
export const DONATION_LIMITS = {
  USD: { min: 1, max: 10_000 },
  KES: { min: 1, max: 500_000 },
} as const;

export type DonationCurrency = keyof typeof DONATION_LIMITS;

export const DONATION_CURRENCIES = Object.keys(DONATION_LIMITS) as DonationCurrency[];

/** The preset amounts for a currency. */
export function presetsFor(currency: DonationCurrency): readonly number[] {
  return currency === "KES" ? KES_PRESETS : USD_PRESETS;
}
