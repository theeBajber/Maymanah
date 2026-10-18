import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getNotesForAppointment } from "@/lib/notes";
import { getCurrentUser } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Lists the follow-up notes tied to one session.
 *
 * Visible to both the teacher who wrote them and the student they concern, so
 * the student can see what their teacher noted. Notes are read-only here; the
 * teacher manages them from the student's page.
 */
export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const { id } = await params;
  const notes = await getNotesForAppointment(user.id, id);

  if (notes === null) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }

  return NextResponse.json({ notes });
}
