import { NextResponse } from "next/server";

import { sendVerificationEmail } from "@/lib/account-recovery";
import { consumeRateLimit } from "@/lib/rate-limit";
import { requestPasswordResetSchema } from "@/lib/validation";

/** Sends another confirmation message for an address that is still unconfirmed. */
const RESEND_LIMIT = { limit: 3, windowMs: 15 * 60 * 1000 };

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 422 });
  }

  const limit = await consumeRateLimit({ key: `verify:resend:${parsed.data.email}`, ...RESEND_LIMIT });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again shortly" }, { status: 429 });
  }

  await sendVerificationEmail(parsed.data.email);

  // Identical to a reset request on purpose: the answer must not reveal whether
  // an account exists or is already confirmed.
  return NextResponse.json({ ok: true, message: "If an account exists and is unconfirmed, a link is on its way" });
}