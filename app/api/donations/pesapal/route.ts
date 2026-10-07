import { NextResponse } from "next/server";

import { providerUnavailable, validateDonationInput } from "../unavailable";

/**
 * Starts a Pesapal checkout. See the card route for why this validates first
 * and refuses afterwards.
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
