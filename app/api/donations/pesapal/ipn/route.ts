import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { pesapalConfig, pesapalOrderStatus, pesapalToken } from "@/lib/pesapal";

/**
 * Receives Pesapal's payment notification.
 *
 * The query string is never trusted for the outcome: the tracking id is read
 * from it, and the actual state is asked from Pesapal directly. A forged
 * callback claiming success changes nothing, since only Pesapal's own answer
 * moves a row to completed.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const trackingId = params.get("OrderTrackingId");
  const merchantReference = params.get("OrderMerchantReference");

  if (!trackingId) {
    return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
  }

  const configured = pesapalConfig();
  if (!configured.ok) {
    return NextResponse.json({ error: configured.error }, { status: 503 });
  }

  const donation =
    (await db.donation.findUnique({ where: { reference: trackingId }, select: { id: true } })) ??
    (merchantReference
      ? await db.donation.findUnique({ where: { id: merchantReference }, select: { id: true } })
      : null);

  if (!donation) {
    return NextResponse.json({ error: "That donation could not be found" }, { status: 404 });
  }

  try {
    const token = await pesapalToken(configured.config);
    const status = await pesapalOrderStatus(token, trackingId);

    await db.donation.update({ where: { id: donation.id }, data: { status } });

    return NextResponse.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId: trackingId,
      orderMerchantReference: merchantReference,
      status: 200,
    });
  } catch (error) {
    console.error("Pesapal status check failed", error);
    return NextResponse.json({ error: "Could not confirm that payment" }, { status: 502 });
  }
}
