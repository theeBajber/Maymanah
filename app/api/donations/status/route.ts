import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { mpesaTimestamp } from "@/lib/donations";
import { mpesaAccessToken, mpesaConfig, queryStkStatus } from "@/lib/mpesa";
import { consumeRateLimit } from "@/lib/rate-limit";

const STATUS_POLL_LIMIT = { limit: 60, windowMs: 60_000 };
const RECONCILE_LIMIT = { limit: 1, windowMs: 30_000 };

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ?? request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Reports the state of an in-flight donation, polled by the interface while
 * it waits for a provider callback. Unknown references read as pending rather
 * than missing, since a payment created moments ago may simply not have
 * reported back yet.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const reference = new URL(request.url).searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Provide the payment reference to check" }, { status: 400 });
  }

  const limit = await consumeRateLimit({
    key: `donation-status:${clientKey(request)}:${reference}`,
    ...STATUS_POLL_LIMIT,
  });

  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many status checks. Try again shortly." }, { status: 429 });
  }

  const donation = await db.donation.findFirst({
    where: { reference },
    select: { id: true, provider: true, status: true },
  });

  if (!donation) {
    return NextResponse.json({ status: "PENDING" });
  }

  if (donation.status === "PENDING" && donation.provider === "mpesa") {
    const reconciled = await reconcileMpesa(donation.id, reference);
    return NextResponse.json({ status: reconciled });
  }

  return NextResponse.json({ status: donation.status });
}

async function reconcileMpesa(donationId: string, reference: string): Promise<string> {
  const throttle = await consumeRateLimit({
    key: `mpesa-reconcile:${reference}`,
    ...RECONCILE_LIMIT,
  });

  if (!throttle.allowed) return "PENDING";

  const configured = mpesaConfig();
  if (!configured.ok) return "PENDING";

  try {
    const token = await mpesaAccessToken(configured.config);
    const result = await queryStkStatus(token, {
      shortCode: configured.config.shortCode,
      passkey: configured.config.passkey,
      timestamp: mpesaTimestamp(),
      checkoutRequestId: reference,
    });

    if (result.status === "PENDING") return "PENDING";

    const updated = await db.donation.updateMany({
      where: { id: donationId, status: "PENDING" },
      data: { status: result.status },
    });

    if (updated.count > 0) return result.status;

    const current = await db.donation.findUnique({
      where: { id: donationId },
      select: { status: true },
    });

    return current?.status ?? "PENDING";
  } catch (error) {
    console.error("M-Pesa status reconciliation failed", error);
    return "PENDING";
  }
}
