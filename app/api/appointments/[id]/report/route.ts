import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { lessonReportFor, submitLessonReport } from "@/lib/lesson-report";
import { db } from "@/lib/db";
import type { RangeProblem } from "@/lib/quran-meta";
import { getCurrentUser } from "@/lib/session";

const rangeSchema = z.object({
  fromSurah: z.number().int().min(1).max(114),
  fromAyah: z.number().int().min(1),
  toSurah: z.number().int().min(1).max(114),
  toAyah: z.number().int().min(1),
});

const reportSchema = z.object({
  attendance: z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]),
  range: rangeSchema.nullish(),
  revision: z.string().max(2_000).nullish(),
  rating: z.number().int().min(1).max(5).nullish(),
  notes: z.string().max(4_000).nullish(),
  nextAssignment: z.string().max(1_000).nullish(),
});

const PROBLEM_MESSAGES: Record<RangeProblem, string> = {
  unknown_surah: "That surah does not exist",
  ayah_out_of_range: "That ayah does not exist in the chosen surah",
  empty_range: "The end of the range must not come before the start",
};

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/** The report for a session, readable by either side of the pairing. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { id } = await params;

  const appointment = await db.appointment.findFirst({
    where: { id, OR: [{ mentorship: { studentId: user.id } }, { teacherId: user.id }] },
    select: { id: true },
  });
  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }

  return NextResponse.json({ report: await lessonReportFor(id) });
}

/**
 * Submits the teacher's post-lesson report.
 *
 * A report is what closes a lesson: until one exists the session is pending,
 * and the student's memorisation ledger does not change. Re-submitting corrects
 * the existing report rather than creating a second one.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the report" },
      { status: 422 },
    );
  }

  const { range, revision, rating, notes, nextAssignment, attendance } = parsed.data;

  const result = await submitLessonReport({
    appointmentId: id,
    teacherId: user.id,
    attendance,
    range: range ?? null,
    revision,
    rating,
    notes,
    nextAssignment,
  });

  if (!result.ok) {
    if (result.reason === "not_found") {
      return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
    }
    if (result.reason === "not_teacher") {
      return NextResponse.json({ error: "Only the teacher submits the report" }, { status: 403 });
    }
    if (result.reason === "range_on_absent") {
      return NextResponse.json(
        { error: "A session the student missed cannot include new memorisation" },
        { status: 422 },
      );
    }
    return NextResponse.json({ error: PROBLEM_MESSAGES[result.problem] }, { status: 422 });
  }

  return NextResponse.json({ report: await lessonReportFor(id) }, { status: 201 });
}
