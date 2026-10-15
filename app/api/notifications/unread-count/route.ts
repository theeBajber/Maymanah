import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { unreadNotificationCount } from "@/lib/notifications";

/** How many unread notifications the badge should show. */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  return NextResponse.json({ count: await unreadNotificationCount(user.id) });
}
