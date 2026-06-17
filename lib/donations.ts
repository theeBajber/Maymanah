export const USD_PRESETS = [5, 10, 25] as const;
export const KES_PRESETS = [500, 1000, 2500] as const;

export const DONATION_LIMITS = {
  USD: { min: 1, max: 10_000 },
  KES: { min: 1, max: 500_000 },
} as const;

export type DonationCurrency = keyof typeof DONATION_LIMITS;

const DEFAULT_USD_TO_KES = 130;

export function getMpesaBaseUrl() {
  if (process.env.MPESA_BASE_URL) {
    return process.env.MPESA_BASE_URL.replace(/\/$/, "");
  }

  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export function getMpesaTimestamp() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

export function toMpesaAmount(
  amount: number,
  currency: DonationCurrency,
): number {
  if (currency === "KES") {
    return Math.round(amount);
  }

  const rate = Number(process.env.USD_TO_KES_RATE) || DEFAULT_USD_TO_KES;
  return Math.round(amount * rate);
}

export function validateDonationAmount(
  amount: unknown,
  currency: DonationCurrency,
): { ok: true; amount: number } | { ok: false; error: string } {
  const parsed = typeof amount === "string" ? Number(amount) : amount;

  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    return { ok: false, error: "Invalid donation amount" };
  }

  const { min, max } = DONATION_LIMITS[currency];

  if (currency === "KES") {
    if (!Number.isInteger(parsed)) {
      return { ok: false, error: "KES donations must be whole amounts" };
    }
  } else if (Math.round(parsed * 100) !== parsed * 100) {
    return {
      ok: false,
      error: "USD donations support at most two decimal places",
    };
  }

  if (parsed < min || parsed > max) {
    return {
      ok: false,
      error: `Amount must be between ${currency === "USD" ? "$" : "KES "}${min.toLocaleString()} and ${currency === "USD" ? "$" : "KES "}${max.toLocaleString()}`,
    };
  }

  return { ok: true, amount: parsed };
}

export function normalizeMpesaPhone(phone: string): string | null {
  let cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("0")) {
    cleanPhone = "254" + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith("+")) {
    cleanPhone = cleanPhone.substring(1);
  }

  if (!/^254[17]\d{8}$/.test(cleanPhone)) {
    return null;
  }

  return cleanPhone;
}

export function stripeCurrencyCode(currency: DonationCurrency) {
  return currency === "USD" ? "usd" : "kes";
}

export function stripeUnitAmount(amount: number, currency: DonationCurrency) {
  if (currency === "USD") {
    return Math.round(amount * 100);
  }

  return Math.round(amount);
}
