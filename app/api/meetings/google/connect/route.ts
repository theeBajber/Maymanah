import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { MeetingError, meetingAuthorisationUrl } from "@/lib/meetings";
import { getCurrentUser } from "@/lib/session";

const STATE_COOKIE = "meeting_oauth_state";
const STATE_TTL_SECONDS = 10 * 60;

function settingsRedirect(query: string): NextResponse {
  return NextResponse.redirect(new URL(`/settings?meeting=${query}`, env().APP_URL));
}

/**
 * Starts the calendar connection flow.
 *
 * The state value is random and kept in an http-only cookie, so a callback the
 * teacher did not initiate is refused. The destination is a fixed page; no
 * caller-supplied URL is ever redirected to.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/settings", env().APP_URL));
  }
  if (user.role !== "TEACHER") return settingsRedirect("forbidden");

  const state = randomBytes(24).toString("base64url");

  try {
    const response = NextResponse.redirect(meetingAuthorisationUrl(state));
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/meetings/google",
      maxAge: STATE_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Could not start the calendar connection", error);
    const reason = error instanceof MeetingError ? error.code : "provider_error";
    return settingsRedirect(reason);
  }
}
