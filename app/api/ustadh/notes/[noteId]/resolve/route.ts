import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { setNoteResolved } from "@/lib/notes";
import { getCurrentUser } from "@/lib/session";

type RouteContext = { params: Promise<{ noteId: string }> };

/** Closes a note the signed-in teacher wrote. */
export async function PATCH(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const { noteId } = await params;
  const result = await setNoteResolved(await auth(), noteId, true);

  if (!result.ok) {
    return NextResponse.json({ error: "That note could not be found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
