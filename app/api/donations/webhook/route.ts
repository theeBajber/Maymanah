import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { mpesaResultHint } from "@/lib/mpesa";

/**
 * Records provider callbacks about money.
 *
 * M-Pesa posts its result here; Stripe posts signed events here. Each branch
 * trusts only what it can verify: M-Pesa callbacks carry no signature, so the
 * row is matched by reference and anything unmatched is ignored; Stripe
 * events are verified by signature before anything is read from them. Either
 * way a callback that arrives twice updates the same row rather than
 * recording the money twice.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");

  if (signature) {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Card webhooks are not configured" }, { status: 503 });
    }

    return handleStripe(request, signature);
  }

  return handleMpesa(request);
}

async function handleMpesa(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const callback = (body ?? {}) as {
    Body?: {
      stkCallback?: {
        CheckoutRequestID?: string;
        ResultCode?: number | string;
        ResultDesc?: string;
      };
    };
  };
  const stk = callback.Body?.stkCallback;

  if (!stk?.CheckoutRequestID) {
    return NextResponse.json({ error: "Not an M-Pesa callback" }, { status: 400 });
  }

  const resultCode = String(stk.ResultCode ?? "");
  if (!resultCode) {
    console.error("M-Pesa callback had no result code", {
      checkoutRequestId: stk.CheckoutRequestID,
    });
    return NextResponse.json({ error: "M-Pesa callback had no result code" }, { status: 400 });
  }

  const status = resultCode === "0" ? "COMPLETED" : "FAILED";
  const updated = await db.donation.updateMany({
    where: { reference: stk.CheckoutRequestID, status: { not: "COMPLETED" } },
    data: { status },
  });

  if (updated.count === 0) {
    const existing = await db.donation.findUnique({
      where: { reference: stk.CheckoutRequestID },
      select: { status: true },
    });

    if (!existing) {
      console.error("M-Pesa callback did not match a donation", {
        checkoutRequestId: stk.CheckoutRequestID,
        resultCode,
      });
    } else if (resultCode !== "0") {
      console.warn("M-Pesa failure callback for an already completed donation", {
        checkoutRequestId: stk.CheckoutRequestID,
        hint: mpesaResultHint(resultCode),
        description: stk.ResultDesc,
      });
    }
  } else if (resultCode !== "0") {
    console.warn("M-Pesa payment failed", {
      checkoutRequestId: stk.CheckoutRequestID,
      resultCode,
      hint: mpesaResultHint(resultCode),
      description: stk.ResultDesc,
    });
  }

  // Safaricom expects this exact shape back, or it retries the callback.
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
}

async function handleStripe(request: Request, signature: string): Promise<NextResponse> {
  const secret = process.env.STRIPE_SECRET_KEY!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(secret);
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "That webhook signature is not valid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const reference = checkout.payment_intent ?? checkout.id;

    const existing = await db.donation.findUnique({ where: { reference: String(reference) }, select: { id: true } });

    if (!existing) {
      const amount = (checkout.amount_total ?? 0) / 100;
      await db.donation.create({
        data: {
          donorId: (checkout.metadata?.userId as string) || null,
          amount,
          currency: (checkout.currency ?? "usd").toUpperCase(),
          provider: "stripe",
          status: "COMPLETED",
          reference: String(reference),
          anonymous: checkout.metadata?.anonymous === "true",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
