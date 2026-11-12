import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { connectMeetingAccount, MeetingError } from "@/lib/meetings";
import { getCurrentUser } from "@/lib/session";

const STATE_COOKIE = "meeting_oauth_state";

function settingsRedirect(query: string): NextResponse {
  return NextResponse.redirect(new URL(`/settings?meeting=${query}`, env().APP_URL));
}

/** Clears the one-time state cookie, whatever the outcome. */
function clearState(response: NextResponse): NextResponse {
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/meetings/google",
    maxAge: 0,
  });
  return response;
}

/**
 * Completes the calendar connection.
 *
 * The state must match the cookie set when the flow began, otherwise the code
 * is discarded. The refresh token is encrypted before it is stored and never
 * leaves the server.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/settings", env().APP_URL));
  }
  if (user.role !== "TEACHER") return settingsRedirect("forbidden");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = request.cookies.get(STATE_COOKIE)?.value;

  if (url.searchParams.get("error") || !code || !state || !expected || state !== expected) {
    return clearState(settingsRedirect("cancelled"));
  }

  try {
    await connectMeetingAccount(user.id, code);
    return clearState(settingsRedirect("connected"));
  } catch (error) {
    console.error("Calendar connection failed", error);
    const reason = error instanceof MeetingError ? error.code : "provider_error";
    return clearState(settingsRedirect(reason));
  }
}
