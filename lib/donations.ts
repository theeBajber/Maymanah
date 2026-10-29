/**
 * Donation amounts and bounds, independent of any payment provider.
 *
 * Only the presentation-facing values live here: what the preset buttons offer,
 * and the range a contribution must fall within. Talking to a payment provider
 * is a separate concern that arrives with the provider itself, so nothing in
 * this file knows that Stripe or M-Pesa exist.
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

/** Shillings per dollar, for providers that only accept local currency. */
const DEFAULT_USD_TO_KES = 130;

export function usdToKesRate(): number {
  const raw = process.env.USD_TO_KES_RATE;
  const parsed = raw === undefined ? Number.NaN : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_USD_TO_KES;
}

/** Converts a dollar amount to shillings, rounding up so the donor never underpays. */
export function toKesAmount(amountUsd: number): number {
  return Math.max(1, Math.ceil(amountUsd * usdToKesRate()));
}

/**
 * Normalises a Kenyan phone number to the network format.
 *
 * Accepts the local, plus-prefixed, and bare forms and returns 254-prefixed
 * digits, or null when the input is not a plausible Safaricom number. Strict
 * on purpose: M-Pesa rejects anything else at send time, and failing here
 * gives a message the donor can act on rather than a provider error.
 */
export function normalizeMpesaPhone(phone: string): string | null {
  const digits = phone.replace(/[^\d]/g, "");
  const normalised = digits.startsWith("0") ? `254${digits.slice(1)}` : digits.startsWith("254") ? digits : null;
  if (!normalised || !/^254[17]\d{8}$/.test(normalised)) return null;
  return normalised;
}

/** Safaricom API base, sandbox unless production is configured. */
export function mpesaBaseUrl(): string {
  if (process.env.MPESA_BASE_URL) return process.env.MPESA_BASE_URL.replace(/\/$/, "");
  return process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

/** Timestamp in the Africa/Nairobi format Safaricom requires. */
export function mpesaTimestamp(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(at);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

/** Stripe currency code, lowercase as the API requires. */
export function stripeCurrencyCode(currency: DonationCurrency): string {
  return currency.toLowerCase();
}

/** Smallest-unit amount for Stripe, so a dollar becomes a hundred cents. */
export function stripeUnitAmount(amount: number, currency: DonationCurrency): number {
  return currency === "KES" ? Math.round(amount) : Math.round(amount * 100);
}

/**
 * Validates a donation request body.
 *
 * Shared by every provider route so the form meets one contract no matter
 * which button was pressed. Bounds come from the currency table, not from
 * each route restating them.
 */
export function validateDonationInput(body: unknown):
  | { ok: true; amount: number; currency: DonationCurrency }
  | { ok: false; error: string } {
  const { amount, currency } = (body ?? {}) as { amount?: unknown; currency?: unknown };

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
