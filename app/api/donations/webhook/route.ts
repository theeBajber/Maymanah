import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

let stripe: Stripe | null = null;
function getStripe() {
  if (stripe) return stripe;
  if (!process.env.STRIPE_SECRET_KEY) return null;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

const mpesaCallbackSchema = z.object({
  Body: z
    .object({
      stkCallback: z
        .object({
          CheckoutRequestID: z.string(),
          ResultCode: z.number(),
          ResultDesc: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

async function handleMpesaCallback(body: string) {
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return null;
  }

  const parsed = mpesaCallbackSchema.safeParse(data);
  if (!parsed.success) return null;

  const callback = parsed.data.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) return null;

  const reference = callback.CheckoutRequestID;
  const resultCode = callback.ResultCode;

  if (resultCode === 0) {
    await prisma.donation.updateMany({
      where: { reference },
      data: { status: "COMPLETED" },
    });
  } else {
    await prisma.donation.updateMany({
      where: { reference },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
}

async function handleStripeWebhook(body: string, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  let event: Stripe.Event;

  try {
    const s = getStripe();
    if (!s) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 },
      );
    }
    event = s.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe Webhook Signature Error:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, anonymous } = session.metadata || {};
    const reference = session.payment_intent
      ? String(session.payment_intent)
      : session.id;

    const existing = await prisma.donation.findFirst({
      where: {
        OR: [{ reference: session.id }, { reference }],
      },
    });

    if (!existing) {
      await prisma.donation.create({
        data: {
          amount: (session.amount_total || 0) / 100,
          currency: (session.currency || "usd").toUpperCase(),
          provider: "stripe",
          status: "COMPLETED",
          reference,
          anonymous: anonymous === "true",
          donorId: userId ? userId : null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  try {
    const mpesaResponse = await handleMpesaCallback(body);
    if (mpesaResponse) {
      return mpesaResponse;
    }
  } catch {
    // Not an M-Pesa callback payload.
  }

  if (signature) {
    return handleStripeWebhook(body, signature);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
