import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { disconnectMeetingAccount, meetingSettingsFor } from "@/lib/meetings";
import { getCurrentUser } from "@/lib/session";

/** Forgets the signed-in teacher's calendar connection. */
export async function POST(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Only teachers can do this" }, { status: 403 });
  }

  await disconnectMeetingAccount(user.id);
  return NextResponse.json(await meetingSettingsFor(user.id));
}
