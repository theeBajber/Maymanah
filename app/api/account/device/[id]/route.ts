import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Signs one device out.
 *
 * Scoped to the signed-in user's own devices. Without that condition the
 * endpoint would accept any identifier and end an arbitrary session, since an
 * identifier is otherwise just a value the client supplies.
 *
 * The record is removed rather than marked inactive, because every request
 * already checks whether the record exists and is active. Deleting it means a
 * revoked device is refused by the same check with no extra branch.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const session = await auth();
  const user = await getCurrentUser(session);

  if (!user) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  const { id } = await params;

  const currentLoginSessionId = (session?.user as { loginSessionId?: string } | undefined)?.loginSessionId;

  if (id === currentLoginSessionId) {
    return NextResponse.json({ error: "Use sign out to end the session on this device" }, { status: 400 });
  }

  const result = await db.loginSession.deleteMany({ where: { id, userId: user.id } });

  if (result.count === 0) {
    return NextResponse.json({ error: "That device is not signed in" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}