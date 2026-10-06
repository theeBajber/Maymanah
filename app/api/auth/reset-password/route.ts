import { NextResponse } from "next/server";

import { resetPasswordWithToken } from "@/lib/account-recovery";
import { consumeRateLimit } from "@/lib/rate-limit";
import { newPasswordSchema } from "@/lib/validation";

/** Attempts allowed against a single reset token. */
const RESET_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const { token, password } = (body ?? {}) as { token?: unknown; password?: unknown };

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "That reset link is not valid" }, { status: 422 });
  }

  const parsed = newPasswordSchema.safeParse({ password });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter a valid password" }, { status: 422 });
  }

  const limit = await consumeRateLimit({ key: `reset:apply:${token.slice(0, 16)}`, ...RESET_LIMIT });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later" }, { status: 429 });
  }

  const result = await resetPasswordWithToken(token, parsed.data.password);

  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "That reset link has expired. Request a new one."
        : "That reset link is not valid or has already been used.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}