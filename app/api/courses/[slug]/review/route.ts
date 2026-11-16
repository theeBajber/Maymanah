import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { issueCertificate } from "@/lib/certificate";
import { courseCompletion } from "@/lib/completion";
import { db } from "@/lib/db";
import { didPassExam } from "@/lib/exams";
import { getCurrentUser } from "@/lib/session";
import { toMultiLine } from "@/lib/text";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().transform(toMultiLine).pipe(z.string().max(2000)).optional(),
});

/**
 * Rates a course.
 *
 * Only someone who finished may review, since a rating from a stranger
 * measures marketing rather than teaching. Re-rating replaces the earlier
 * verdict rather than adding a second voice for one person.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 422 });
  }

  const course = await db.course.findUnique({ where: { slug }, select: { id: true, slug: true } });
  if (!course) {
    return NextResponse.json({ error: "That course could not be found" }, { status: 404 });
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status === "DROPPED") {
    return NextResponse.json({ error: "Finish the course before reviewing it" }, { status: 403 });
  }

  // The completion rule is the course's own: every lesson, or — for Hifdh —
  // the whole Quran. Reading it here keeps a direct request from rating a
  // course the page would not yet open for review.
  const completion = await courseCompletion(user.id, course);
  if (!completion.completed) {
    return NextResponse.json({ error: "Finish the course before reviewing it" }, { status: 403 });
  }

  // The review is the step after the final exam. A course without a final exam
  // goes straight from completion to review, so the barrier only applies when
  // there is an exam to pass.
  const finalExam = await db.exam.findFirst({
    where: { courseId: course.id, examType: "FINAL", isPublished: true },
    select: {
      passMark: true,
      questions: { select: { marks: true } },
      submissions: {
        where: { studentId: user.id, status: { in: ["SUBMITTED", "GRADED"] } },
        orderBy: { attemptNumber: "desc" },
        take: 1,
        select: { status: true, totalScore: true },
      },
    },
  });

  if (finalExam) {
    const attempt = finalExam.submissions[0];
    const totalMarks = finalExam.questions.reduce((sum, question) => sum + question.marks, 0);
    const passed =
      attempt?.status === "GRADED" &&
      didPassExam(attempt.totalScore, totalMarks, finalExam.passMark);
    if (!passed) {
      return NextResponse.json(
        { error: "Pass the final exam before reviewing the course" },
        { status: 403 },
      );
    }
  }

  const review = await db.courseReview.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id, rating: parsed.data.rating, comment: parsed.data.comment || null },
    update: { rating: parsed.data.rating, comment: parsed.data.comment || null },
  });

  // The review is the last step: it releases the certificate. Issuing is
  // idempotent, so editing an existing review does not create a second one.
  const certificate = await issueCertificate(user.id, course.id);

  return NextResponse.json(
    { ok: true, id: review.id, certificateId: certificate.id },
    { status: 201 },
  );
}
