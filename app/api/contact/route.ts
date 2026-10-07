import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { submitContactMessage } from "@/lib/contact";
import { toMultiLine, toSingleLine } from "@/lib/text";

/**
 * Public endpoint for the contact form.
 *
 * Normalised through the same text helpers as every other form, so a name is
 * folded and a message is stripped of control characters whichever way it
 * arrives.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const { name, email, message } = (body ?? {}) as { name?: unknown; email?: unknown; message?: unknown };

  const headerStore = await headers();
  const clientIp =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";

  const result = await submitContactMessage({
    name: toSingleLine(String(name ?? "")),
    email: toSingleLine(String(email ?? "")).toLowerCase(),
    message: toMultiLine(String(message ?? "")),
    clientIp,
  });

  if (result.ok) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  switch (result.reason) {
    case "rate_limited":
      return NextResponse.json({ error: "Too many messages sent. Try again later." }, { status: 429 });
    case "too_short":
      return NextResponse.json({ error: "Please write a little more so we can help." }, { status: 422 });
    case "too_long":
      return NextResponse.json({ error: "That message is too long." }, { status: 422 });
    case "invalid_address":
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
    default:
      return NextResponse.json(
        { error: "We could not send your message just now. Please try again shortly." },
        { status: 503 },
      );
  }
}