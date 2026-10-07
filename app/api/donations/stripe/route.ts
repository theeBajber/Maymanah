import { NextResponse } from "next/server";

import { providerUnavailable, validateDonationInput } from "../unavailable";

/**
 * Starts a card payment. The provider is not connected, so every well-formed
 * request is validated and then refused plainly. The shape of both answers
 * already matches what the real implementation will return.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const validated = validateDonationInput(body);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 422 });

  return providerUnavailable();
}
