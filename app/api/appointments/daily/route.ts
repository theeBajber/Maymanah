import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createTestAppointment, createTodaysAppointment } from "@/lib/pairing";
import { getCurrentUser } from "@/lib/session";

/**
 * Opens the student's session for today.
 *
 * A session is created only for a slot that genuinely falls today, so this can
 * be pressed repeatedly without piling up duplicate appointments. `?test=1`
 * bypasses that and starts one immediately, and is refused unless the running
 * instance is in test mode.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const isTest = new URL(request.url).searchParams.get("test") === "1";
  if (isTest && process.env.TEST_MODE !== "true") {
    return NextResponse.json({ error: "Test sessions are not enabled" }, { status: 403 });
  }

  const appointment = isTest ? await createTestAppointment(user.id) : await createTodaysAppointment(user.id);
  if (!appointment) {
    return NextResponse.json({ error: "No session scheduled for today" }, { status: 404 });
  }

  return NextResponse.json({ id: appointment.id });
}
