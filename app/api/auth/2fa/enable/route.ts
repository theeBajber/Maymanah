import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { sendEnrolmentCode } from "@/lib/two-factor-enrol";

/**
 * Sends an enrolment code to the address already on the account.
 *
 * Takes no body. The destination is read from the account rather than supplied
 * by the caller, so enrolment cannot be pointed at an address the user does
 * not control.
 */
export async function POST(): Promise<NextResponse> {
  const session = await auth();
  if (!(await getCurrentUser(session))) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  const result = await sendEnrolmentCode(session);

  if (!result.ok) {
    if (result.reason === "already_enabled") {
      return NextResponse.json({ error: "Two-factor authentication is already on" }, { status: 409 });
    }
    return NextResponse.json({ error: "Too many attempts. Try again shortly" }, { status: 429 });
  }

  return NextResponse.json({ ok: true, message: "A code is on its way to your email address" });
}