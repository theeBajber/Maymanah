import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const readSchema = z.object({ senderId: z.string().min(1) });

/**
 * Marks a thread read.
 *
 * Only messages addressed to the caller are affected. Nothing sent, and
 * nothing addressed to anyone else, changes — reading a conversation marks
 * what arrived, not what left.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = readSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Say whose messages to mark read" }, { status: 422 });
  }

  await db.message.updateMany({
    where: { senderId: parsed.data.senderId, receiverId: user.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
