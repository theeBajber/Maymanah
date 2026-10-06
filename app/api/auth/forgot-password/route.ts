import { NextResponse } from "next/server";

import { sendPasswordResetEmail } from "@/lib/account-recovery";
import { consumeRateLimit } from "@/lib/rate-limit";
import { requestPasswordResetSchema } from "@/lib/validation";

/** Attempts per client address, to stop this being used to flood a mailbox. */
const REQUEST_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

async function clientKey(request: Request): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ?? request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Sends a password reset message.
 *
 * Always answers with the same body. Whether an account exists is never
 * revealed, because an endpoint that answered differently would let anyone test
 * whether a given person is registered here.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const limit = await consumeRateLimit({ key: `reset:request:${await clientKey(request)}`, ...REQUEST_LIMIT });

  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later" }, { status: 429 });
  }

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

  await sendPasswordResetEmail(parsed.data.email);

  return NextResponse.json({ ok: true, message: "If an account exists, a reset link is on its way" });
}