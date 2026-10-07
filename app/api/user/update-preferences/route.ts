import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { readPreferences, updatePreferencesSchema, writePreferences } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

export async function GET(): Promise<NextResponse> {
  const view = await readPreferences(await auth());
  if (!view) return unauthorized();

  return NextResponse.json(view);
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!(await getCurrentUser(session))) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the highlighted fields" }, { status: 422 });
  }

  await writePreferences(session, parsed.data);

  return NextResponse.json({ ok: true });
}