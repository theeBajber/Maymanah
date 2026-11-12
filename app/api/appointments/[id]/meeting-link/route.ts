import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { clearManualMeetingLink, MeetingError, setManualMeetingLink } from "@/lib/meetings";
import { getCurrentUser } from "@/lib/session";

const bodySchema = z.object({
  url: z.string().min(1, "Paste a meeting link"),
});

function failure(error: unknown): NextResponse {
  if (error instanceof MeetingError) {
    const status =
      error.code === "invalid_link" ? 422 : error.code === "not_configured" ? 503 : 404;
    return NextResponse.json({ error: error.message }, { status });
  }
  console.error("Meeting link error", error);
  return NextResponse.json({ error: "Could not save that meeting link" }, { status: 500 });
}

/**
 * Sets the teacher's own room address for one lesson.
 *
 * The address is validated here rather than trusted from the form, because it
 * is later handed to the student. It is not echoed back: the join route is the
 * only place a raw address is released.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Only the teacher can set the meeting link" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Paste a meeting link" },
      { status: 422 },
    );
  }

  const { id } = await params;

  try {
    await setManualMeetingLink(id, user.id, parsed.data.url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

/** Removes the teacher's own link from one lesson. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Only the teacher can remove the meeting link" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await clearManualMeetingLink(id, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
