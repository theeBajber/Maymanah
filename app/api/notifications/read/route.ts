import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const readSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

/**
 * Marks notifications read, by id or all at once.
 *
 * Scoped to the caller's own unread rows either way. Asking with neither ids
 * nor all set changes nothing but still succeeds, since there is nothing to
 * refuse about an empty request.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = readSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the request" }, { status: 422 });
  }

  const { ids, all } = parsed.data;

  if ((ids === undefined || ids.length === 0) && !all) {
    return NextResponse.json({ ok: true });
  }

  await db.notification.updateMany({
    where: { userId: user.id, isRead: false, ...(all ? {} : { id: { in: ids } }) },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
