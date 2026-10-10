import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { completeLesson } from "@/lib/courses";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/** One lesson with its neighbours and the reader's progress on it. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; lessonId: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { slug, lessonId } = await params;

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, isPublished: true, course: { slug, isPublished: true, isActive: true } },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      audioUrl: true,
      order: true,
      duration: true,
      courseId: true,
      course: { select: { title: true, slug: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "That lesson could not be found" }, { status: 404 });
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    return NextResponse.json({ error: "Enrol in the course to read its lessons" }, { status: 403 });
  }

  const [progress, neighbours] = await Promise.all([
    db.lessonProgress.findUnique({
      where: { studentId_lessonId: { studentId: user.id, lessonId } },
      select: { completed: true, score: true },
    }),
    db.lesson.findMany({
      where: { courseId: lesson.courseId, isPublished: true },
      orderBy: { order: "asc" },
      select: { id: true, title: true, order: true },
    }),
  ]);

  const position = neighbours.findIndex((row) => row.id === lessonId);

  return NextResponse.json({
    lesson,
    progress: { completed: progress?.completed ?? false, score: progress?.score ?? null },
    previous: position > 0 ? neighbours[position - 1] : null,
    next: position >= 0 && position < neighbours.length - 1 ? neighbours[position + 1] : null,
  });
}

const completeSchema = z.object({
  score: z.number().min(0).max(100).optional(),
});

/** Marks a lesson complete and returns the refreshed course percentage. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; lessonId: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!(await getCurrentUser(session))) return unauthorized();

  const { lessonId } = await params;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Score must be between 0 and 100" }, { status: 422 });
  }

  const result = await completeLesson(session, lessonId, parsed.data.score);

  if (!result.ok) {
    if (result.reason === "missing") {
      return NextResponse.json({ error: "That lesson could not be found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Enrol in the course first" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, progress: result.progress });
}