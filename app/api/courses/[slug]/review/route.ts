import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

  const course = await db.course.findUnique({ where: { slug }, select: { id: true } });
  if (!course) {
    return NextResponse.json({ error: "That course could not be found" }, { status: 404 });
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "COMPLETED") {
    return NextResponse.json({ error: "Finish the course before reviewing it" }, { status: 403 });
  }

  const review = await db.courseReview.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id, rating: parsed.data.rating, comment: parsed.data.comment || null },
    update: { rating: parsed.data.rating, comment: parsed.data.comment || null },
  });

  return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
}
