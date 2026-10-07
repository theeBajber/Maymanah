import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  beginEnablingTwoFactor,
  changePassword,
  confirmEnablingTwoFactor,
  disableTwoFactor,
  revokeEverything,
} from "@/lib/account-settings";
import { getCurrentUser } from "@/lib/session";
import { newPasswordSchema, verifyCodeSchema } from "@/lib/validation";

/**
 * Account settings.
 *
 * A session is required, and the user is read from the database rather than from
 * the cookie, so a revoked device cannot change anything even if its cookie is
 * still being presented.
 */

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  const user = await getCurrentUser(session);
  return user?.id ?? null;
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return ((await request.json()) ?? {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function fail(reason: string, status: number, message: string) {
  return NextResponse.json({ error: message, reason }, { status });
}

/** Turns an internal failure into words a person can act on. */
function explain(reason: string): { status: number; message: string } {
  switch (reason) {
    case "wrong_password":
      return { status: 401, message: "That password is not correct." };
    case "already_enabled":
      return { status: 409, message: "Two-factor authentication is already on." };
    case "not_enabled":
      return { status: 409, message: "Two-factor authentication is not on." };
    case "invalid_code":
      return { status: 400, message: "That code is not right or has expired. Ask for a new one." };
    case "rate_limited":
      return { status: 429, message: "Too many attempts. Try again shortly." };
    case "not_sent":
      return { status: 503, message: "We could not send the code. Try again shortly." };
    default:
      return { status: 422, message: "That did not work. Check the fields and try again." };
  }
}

/** Starts two-factor enrolment by sending a code to the address on the account. */
export async function POST(request: Request): Promise<NextResponse> {
  const userId = await requireUserId();
  if (!userId) return fail("unauthenticated", 401, "Sign in to change this");

  const action = new URL(request.url).searchParams.get("action");
  const body = await readBody(request);

  if (action === "enable") {
    const result = await beginEnablingTwoFactor(userId, String(body.password ?? ""));
    if (!result.ok) {
      const { status, message } = explain(result.reason);
      return fail(result.reason, status, message);
    }
    return NextResponse.json({ ok: true, message: "We sent a six digit code to your email address." });
  }

  if (action === "confirm-enable") {
    const parsed = verifyCodeSchema.safeParse({ code: body.code });
    if (!parsed.success) return fail("invalid_code", 422, parsed.error.issues[0]?.message ?? "Enter the six digit code");

    const result = await confirmEnablingTwoFactor(userId, parsed.data.code);
    if (!result.ok) {
      const { status, message } = explain(result.reason);
      return fail(result.reason, status, message);
    }

    return NextResponse.json({ ok: true, signedOutEverywhere: true });
  }

  if (action === "disable") {
    const parsed = verifyCodeSchema.safeParse({ code: body.code });
    if (!parsed.success) return fail("invalid_code", 422, parsed.error.issues[0]?.message ?? "Enter the six digit code");

    const result = await disableTwoFactor(userId, String(body.password ?? ""), parsed.data.code);
    if (!result.ok) {
      const { status, message } = explain(result.reason);
      return fail(result.reason, status, message);
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "change-password") {
    const parsed = newPasswordSchema.safeParse({ password: body.newPassword });
    if (!parsed.success) {
      return fail("password_too_short", 422, parsed.error.issues[0]?.message ?? "Enter a valid password");
    }

    const result = await changePassword(userId, String(body.currentPassword ?? ""), parsed.data.password);
    if (!result.ok) {
      const { status, message } = explain(result.reason);
      return fail(result.reason, status, message);
    }

    await revokeEverything(userId);
    return NextResponse.json({ ok: true, signedOutEverywhere: true });
  }

  return fail("unknown_action", 400, "Unknown action");
}

/**
 * Ends every signed-in device.
 *
 * Responds rather than redirecting, because the caller is the settings page and
 * needs to know it worked. The cookie is cleared afterwards by the client
 * navigating away; marking every device inactive is what actually ends the
 * sessions, since a cookie is self-contained.
 */
export async function DELETE(): Promise<NextResponse> {
  const userId = await requireUserId();
  if (!userId) return fail("unauthenticated", 401, "Sign in to do this");

  await revokeEverything(userId);

  return NextResponse.json({ ok: true });
}