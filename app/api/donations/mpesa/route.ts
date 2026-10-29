import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeMpesaPhone, toKesAmount, validateDonationInput, mpesaTimestamp } from "@/lib/donations";
import { mpesaAccessToken, mpesaConfig, sendStkPush } from "@/lib/mpesa";
import { getCurrentUser } from "@/lib/session";

/**
 * Sends an M-Pesa payment prompt to a phone.
 *
 * Records the donation as pending first, so a prompt that never completes is
 * still accounted for rather than invisible. Dollar amounts are converted to
 * shillings, since M-Pesa only moves local currency.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const configured = mpesaConfig();
  if (!configured.ok) {
    return NextResponse.json({ error: configured.error }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const validated = validateDonationInput(body);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 422 });

  const { phone, anonymous } = (body ?? {}) as { phone?: unknown; anonymous?: unknown };
  if (typeof phone !== "string") {
    return NextResponse.json({ error: "Enter the M-Pesa phone number to prompt" }, { status: 422 });
  }

  const cleanPhone = normalizeMpesaPhone(phone);
  if (!cleanPhone) {
    return NextResponse.json({ error: "Enter a valid Safaricom number, like 0712 345 678" }, { status: 422 });
  }

  const amountKes = validated.currency === "KES" ? Math.round(validated.amount) : toKesAmount(validated.amount);
  if (amountKes < 1) {
    return NextResponse.json({ error: "That amount is too small for M-Pesa" }, { status: 422 });
  }

  const session = await auth();
  const user = await getCurrentUser(session);
  const donorId = !anonymous && user ? user.id : null;

  const donation = await db.donation.create({
    data: {
      donorId,
      amount: validated.amount,
      currency: validated.currency,
      provider: "mpesa",
      status: "PENDING",
      anonymous: Boolean(anonymous),
    },
    select: { id: true },
  });

  try {
    const token = await mpesaAccessToken(configured.config);
    const { checkoutRequestId } = await sendStkPush(token, {
      shortCode: configured.config.shortCode,
      passkey: configured.config.passkey,
      timestamp: mpesaTimestamp(),
      amountKes,
      phone: cleanPhone,
      callbackUrl: configured.config.callbackUrl,
      transactionType: configured.config.transactionType,
      partyB: configured.config.partyB,
    });

    await db.donation.update({ where: { id: donation.id }, data: { reference: checkoutRequestId } });

    return NextResponse.json({ ok: true, checkoutRequestId, mpesaAmount: amountKes });
  } catch (error) {
    await db.donation.update({ where: { id: donation.id }, data: { status: "FAILED" } });
    console.error("M-Pesa prompt failed", error);
    return NextResponse.json({ error: "M-Pesa did not accept the payment request" }, { status: 502 });
  }
}
