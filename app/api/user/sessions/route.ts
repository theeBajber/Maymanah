import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Lists the signed-in devices.
 *
 * Sessions older than seven days are omitted. They expire on their own and
 * would otherwise accumulate into a list nobody reads.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const sessions = await db.loginSession.findMany({
    where: { userId: user.id, isActive: true, lastSeenAt: { gte: weekAgo } },
    orderBy: { lastSeenAt: "desc" },
    select: { id: true, deviceName: true, ipAddress: true, lastSeenAt: true, createdAt: true },
  });

  // `lastActivity` is the name the settings page reads. Renamed at the
  // boundary so the stored field can keep the name the rest of the codebase
  // uses without the page needing to know.
  return NextResponse.json({
    sessions: sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      ipAddress: session.ipAddress,
      lastActivity: session.lastSeenAt,
      createdAt: session.createdAt,
    })),
  });
}

/**
 * Signs one device out.
 *
 * Scoped to the caller's own devices. Without the user condition this would
 * accept any identifier and end an arbitrary session, since an identifier is
 * otherwise just a value the client supplies.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const { sessionId } = (body ?? {}) as { sessionId?: unknown };
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return NextResponse.json({ error: "Choose a device to sign out" }, { status: 422 });
  }

  const result = await db.loginSession.updateMany({
    where: { id: sessionId, userId: user.id, isActive: true },
    data: { isActive: false },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "That device is not signed in" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}