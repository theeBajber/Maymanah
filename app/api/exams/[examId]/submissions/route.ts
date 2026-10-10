import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { submitExam } from "@/lib/exams";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const answerSchema = z.object({
  questionId: z.string().min(1),
  selectedOption: z.number().int().min(0).optional(),
  answerText: z.string().max(5000).optional(),
});

const submitSchema = z.object({
  answers: z.array(answerSchema).max(200),
});

/**
 * Submits an exam attempt for grading.
 *
 * Choice questions come back marked at once; a submission with written answers
 * comes back ungraded for a marker. Retakes start new attempts rather than
 * overwriting earlier ones.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!(await getCurrentUser(session))) return unauthorized();

  const { examId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the answers" }, { status: 422 });
  }

  const result = await submitExam(session, examId, parsed.data.answers);

  if (!result.ok) {
    if (result.reason === "missing") {
      return NextResponse.json({ error: "That exam could not be found" }, { status: 404 });
    }
    if (result.reason === "not_enrolled") {
      return NextResponse.json({ error: "Enrol in the course first" }, { status: 403 });
    }
    if (result.reason === "closed") {
      return NextResponse.json({ error: "That exam is not currently open" }, { status: 410 });
    }
    return NextResponse.json({ error: "You already have an attempt in progress" }, { status: 409 });
  }

  return NextResponse.json({ ok: true, ...result.result }, { status: 201 });
}
