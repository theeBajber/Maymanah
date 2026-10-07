import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { readProfile, updateProfileSchema, writeProfile } from "@/lib/profile";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

export async function GET(): Promise<NextResponse> {
  const view = await readProfile(await auth());
  if (!view) return unauthorized();

  return NextResponse.json(view);
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!(await getCurrentUser(session))) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the highlighted fields" }, { status: 422 });
  }

  const result = await writeProfile(session, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: "That email address is already in use" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}