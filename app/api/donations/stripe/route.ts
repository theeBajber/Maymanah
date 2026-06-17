import { auth } from "@/lib/auth";
import {
  stripeCurrencyCode,
  stripeUnitAmount,
  validateDonationAmount,
  type DonationCurrency,
} from "@/lib/donations";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 },
      );
    }

    const body = await req.json();
    const { amount, anonymous, currency = "USD" } = body;
    const donationCurrency = currency as DonationCurrency;

    if (donationCurrency !== "USD" && donationCurrency !== "KES") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const validation = validateDonationAmount(amount, donationCurrency);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const session = await auth();
    const userId = !anonymous && session?.user?.id ? session.user.id : null;

    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const stripeCurrency = stripeCurrencyCode(donationCurrency);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: "Donation to Maymanah",
              description:
                "Thank you for supporting our free Quran learning platform.",
            },
            unit_amount: stripeUnitAmount(validation.amount, donationCurrency),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/donate?success=true`,
      cancel_url: `${origin}/donate?canceled=true`,
      metadata: {
        userId: userId ?? "",
        anonymous: String(Boolean(anonymous)),
        currency: donationCurrency,
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Could not create Stripe checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: "Could not create Stripe session. Please try again." },
      { status: 500 },
    );
  }
}
