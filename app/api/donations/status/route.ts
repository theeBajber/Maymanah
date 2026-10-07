import { NextResponse } from "next/server";

/**
 * Reports the state of an in-flight donation, polled by the interface while it
 * waits for a provider callback.
 *
 * Nothing can be in flight before a provider is connected, so every reference
 * is unknown. Answered rather than left to 404 so the polling loop ends on a
 * message instead of on a missing route.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const reference = new URL(request.url).searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Provide the payment reference to check." }, { status: 400 });
  }

  return NextResponse.json({ error: "Donation tracking is not connected yet." }, { status: 503 });
}
