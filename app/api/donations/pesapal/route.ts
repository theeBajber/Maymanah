import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateDonationInput } from "@/lib/donations";
import { getCurrentUser } from "@/lib/session";
import { pesapalConfig, pesapalToken, registerPesapalIpn, submitPesapalOrder } from "@/lib/pesapal";
import { toSingleLine } from "@/lib/text";

/**
 * Starts a Pesapal checkout for cards, banks, and mobile money.
 *
 * The donor leaves for Pesapal's page and returns to the donation page; the
 * IPN notification records the outcome. The tracking id is returned so the
 * interface can poll for completion while the donor is away.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const configured = pesapalConfig();
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

  const { anonymous, email, phone } = (body ?? {}) as { anonymous?: unknown; email?: unknown; phone?: unknown };

  const session = await auth();
  const user = await getCurrentUser(session);
  const donorId = !anonymous && user ? user.id : null;
  const donorEmail =
    typeof email === "string" && email.includes("@") ? email : user && !anonymous ? user.email : undefined;

  const donation = await db.donation.create({
    data: {
      donorId,
      amount: validated.amount,
      currency: validated.currency,
      provider: "pesapal",
      status: "PENDING",
      anonymous: Boolean(anonymous),
    },
    select: { id: true },
  });

  try {
    const origin = new URL(request.url).origin;
    const token = await pesapalToken(configured.config);
    const ipnUrl =
      process.env.PESAPAL_IPN_URL ?? `${origin}/api/donations/pesapal/ipn`;
    const notificationId = await registerPesapalIpn(token, ipnUrl);

    const { redirectUrl, trackingId } = await submitPesapalOrder(token, {
      amount: validated.amount,
      currency: validated.currency,
      description: "Donation to Maymanah",
      callbackUrl: `${origin}/donate?success=true`,
      notificationId,
      email: donorEmail,
      phone: typeof phone === "string" ? toSingleLine(phone) : undefined,
      merchantReference: donation.id,
    });

    await db.donation.update({ where: { id: donation.id }, data: { reference: trackingId } });

    return NextResponse.json({ ok: true, redirectUrl, trackingId });
  } catch (error) {
    await db.donation.update({ where: { id: donation.id }, data: { status: "FAILED" } });
    console.error("Pesapal checkout failed", error);
    return NextResponse.json({ error: "Pesapal did not accept the order" }, { status: 502 });
  }
}
