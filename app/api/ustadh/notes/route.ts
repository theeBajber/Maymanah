import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { createStudentNote, NOTE_MAX_LENGTH } from "@/lib/notes";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const noteSchema = z.object({
  studentId: z.string().min(1),
  content: z.string().min(1).max(NOTE_MAX_LENGTH),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  appointmentId: z.string().min(1).optional(),
});

/** Writes a follow-up note for a student the teacher currently mentors. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();
  if (user.role !== "TEACHER") {
    return NextResponse.json({ error: "Only teachers can write notes" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the note" },
      { status: 422 },
    );
  }

  const result = await createStudentNote(await auth(), parsed.data);

  if (!result.ok) {
    if (result.reason === "no_mentorship") {
      return NextResponse.json({ error: "No active mentorship with this student" }, { status: 403 });
    }
    if (result.reason === "bad_session") {
      return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Check the note" }, { status: 422 });
  }

  return NextResponse.json({ id: result.id }, { status: 201 });
}
