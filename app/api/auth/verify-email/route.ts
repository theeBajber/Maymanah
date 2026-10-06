import { NextResponse } from "next/server";

import { verifyEmailToken } from "@/lib/account-recovery";

/**
 * Confirms an email address from a token.
 *
 * Reached as a link in a confirmation message, so it answers with something a
 * person can read rather than only a status code.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "That confirmation link is not valid" }, { status: 400 });
  }

  const result = await verifyEmailToken(token);

  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "That confirmation link has expired. Ask for a new one."
        : "That confirmation link is not valid or has already been used.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email: result.value });
}