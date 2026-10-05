import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { registerUser } from "@/lib/registration";
import { registerSchema } from "@/lib/validation";

/**
 * The client address, as reported by the platform in front of the application.
 *
 * Only meaningful when the app sits behind a proxy that sets these, which is the
 * case in every deployment that has a rate limit worth having. The values are
 * client-controlled, so they are used to throttle rather than to authorise.
 */
async function clientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ?? headerStore.get("x-real-ip") ?? "unknown";
}

function problem(status: number, message: string, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, ...(fields ? { fields } : {}) }, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return problem(400, "Send a JSON body");
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    // Every problem is reported at once so the form can show all of them,
    // rather than making the person resubmit to discover the next one.
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return problem(422, "Check the highlighted fields", fields);
  }

  const result = await registerUser(parsed.data, await clientIp());

  if (result.ok) {
    // Deliberately says nothing about the account beyond that it was created.
    // The identifier is not echoed back; it is never needed by the caller.
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (result.reason === "email_taken") {
    return problem(409, "An account already exists for that email address");
  }

  return problem(429, "Too many attempts. Try again later");
}
