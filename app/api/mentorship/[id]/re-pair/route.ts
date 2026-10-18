import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { unpairStudent } from "@/lib/pairing";
import { getCurrentUser } from "@/lib/session";

/**
 * Ends the signed-in student's pairing so they can be matched again.
 *
 * Only the student in the pairing may call this, and only for a pairing that is
 * still active; the mentor is not consulted because a student asking for a
 * different one is reason enough.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const { id } = await params;
  const ended = await unpairStudent(user.id, id);
  if (!ended) {
    return NextResponse.json({ error: "That pairing could not be found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
