import { NextResponse } from "next/server";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { stripeCurrencyCode, stripeUnitAmount, validateDonationInput } from "@/lib/donations";

/**
 * Starts a card payment through Stripe Checkout.
 *
 * The donor leaves for Stripe's page and returns to the donation page; the
 * webhook records the money. Nothing about the card touches this server.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Card payments are not connected yet" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const { anonymous } = (body ?? {}) as { anonymous?: unknown };
  const validated = validateDonationInput(body);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 422 });

  const session = await auth();
  const user = await getCurrentUser(session);
  const donorId = !anonymous && user ? user.id : null;

  const origin = new URL(request.url).origin;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const checkout = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: stripeCurrencyCode(validated.currency),
            product_data: {
              name: "Donation to Maymanah",
              description: "Thank you for keeping Quranic education free.",
            },
            unit_amount: stripeUnitAmount(validated.amount, validated.currency),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/donate?success=true`,
      cancel_url: `${origin}/donate?canceled=true`,
      metadata: {
        userId: donorId ?? "",
        anonymous: String(Boolean(anonymous)),
        currency: validated.currency,
      },
    });

    if (!checkout.url) {
      return NextResponse.json({ error: "Could not start card payment. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Could not create Stripe session", error);
    return NextResponse.json({ error: "Could not start card payment. Please try again." }, { status: 502 });
  }
}
