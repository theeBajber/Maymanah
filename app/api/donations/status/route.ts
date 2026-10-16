import { NextResponse } from "next/server";

import { db } from "@/lib/db";

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

  const donation = await db.donation.findFirst({
    where: { reference },
    select: { status: true },
  });

  return NextResponse.json({ status: donation?.status ?? "PENDING" });
}
