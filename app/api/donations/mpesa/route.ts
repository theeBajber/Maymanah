import { auth } from "@/lib/auth";
import {
  getMpesaBaseUrl,
  getMpesaTimestamp,
  normalizeMpesaPhone,
  toMpesaAmount,
  validateDonationAmount,
  type DonationCurrency,
} from "@/lib/donations";
import { prisma, safeQuery } from "@/lib/prisma";
import { NextResponse } from "next/server";

type MpesaTokenResponse = {
  access_token?: string;
  errorMessage?: string;
  errorCode?: string;
};

type MpesaStkResponse = {
  ResponseCode?: string;
  ResponseDescription?: string;
  CheckoutRequestID?: string;
  errorMessage?: string;
  fault?: { faultstring?: string };
};

async function getMpesaToken() {
  const baseUrl = getMpesaBaseUrl();
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const response = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    },
  );

  const data = (await response.json()) as MpesaTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.errorMessage ||
        `M-Pesa authentication failed (${response.status})`,
    );
  }

  return data.access_token;
}

function mpesaErrorMessage(data: MpesaStkResponse, fallback: string) {
  return (
    data.ResponseDescription ||
    data.errorMessage ||
    data.fault?.faultstring ||
    fallback
  );
}

export async function POST(req: Request) {
  let donationId: string | null = null;

  try {
    const requiredEnv = [
      "MPESA_CONSUMER_KEY",
      "MPESA_CONSUMER_SECRET",
      "MPESA_SHORTCODE",
      "MPESA_PASSKEY",
      "MPESA_CALLBACK_URL",
    ];

    const missing = requiredEnv.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `M-Pesa is not configured (${missing.join(", ")})` },
        { status: 503 },
      );
    }

    const body = await req.json();
    const { amount, phone, anonymous, currency = "KES" } = body;
    const donationCurrency = currency as DonationCurrency;

    if (donationCurrency !== "USD" && donationCurrency !== "KES") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const validation = validateDonationAmount(amount, donationCurrency);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required for M-Pesa donations" },
        { status: 400 },
      );
    }

    const cleanPhone = normalizeMpesaPhone(phone);
    if (!cleanPhone) {
      return NextResponse.json(
        { error: "Invalid M-Pesa phone number format (use 2547XXXXXXXX)" },
        { status: 400 },
      );
    }

    const mpesaAmount = toMpesaAmount(validation.amount, donationCurrency);
    if (mpesaAmount < 1) {
      return NextResponse.json(
        { error: "Donation amount is too small for M-Pesa" },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = !anonymous && session?.user?.id ? session.user.id : null;

    const donation = await safeQuery(() =>
      prisma.donation.create({
        data: {
          amount: validation.amount,
          currency: donationCurrency,
          provider: "mpesa",
          status: "PENDING",
          anonymous: Boolean(anonymous),
          donorId: userId,
        },
      }),
    );
    donationId = donation.id;

    const token = await getMpesaToken();
    const baseUrl = getMpesaBaseUrl();
    const timestamp = getMpesaTimestamp();
    const shortCode = process.env.MPESA_SHORTCODE!;
    const password = Buffer.from(
      `${shortCode}${process.env.MPESA_PASSKEY}${timestamp}`,
    ).toString("base64");

    const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: Number(shortCode),
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: mpesaAmount,
        PartyA: cleanPhone,
        PartyB: Number(shortCode),
        PhoneNumber: cleanPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "Maymanah",
        TransactionDesc: "Donation to Maymanah",
      }),
    });

    const raw = await response.text();
    let data: MpesaStkResponse;

    try {
      data = JSON.parse(raw) as MpesaStkResponse;
    } catch {
      throw new Error("Unexpected response from M-Pesa");
    }

    if (data.ResponseCode === "0" && data.CheckoutRequestID) {
      await safeQuery(() =>
        prisma.donation.update({
          where: { id: donation.id },
          data: { reference: data.CheckoutRequestID },
        }),
      );

      return NextResponse.json({
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
        mpesaAmount,
      });
    }

    await safeQuery(() =>
      prisma.donation.update({
        where: { id: donation.id },
        data: { status: "FAILED" },
      }),
    );

    return NextResponse.json(
      {
        error: mpesaErrorMessage(data, "M-Pesa STK Push failed"),
      },
      { status: 400 },
    );
  } catch (err) {
    console.error("M-Pesa STK Push Error:", err);

    if (donationId) {
      try {
        await safeQuery(() =>
          prisma.donation.update({
            where: { id: donationId! },
            data: { status: "FAILED" },
          }),
        );
      } catch {
        // Ignore cleanup errors.
      }
    }

    const message =
      err instanceof Error ? err.message : "M-Pesa service error. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
