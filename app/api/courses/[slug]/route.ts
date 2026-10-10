import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { dropCourse, enrollInCourse, getCourseDetail } from "@/lib/courses";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const actionSchema = z.object({
  action: z.enum(["enroll", "drop"]),
  key: z.string().optional(),
});

/** One course with its lessons, the reader's progress, and its rating. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const course = await getCourseDetail(await auth(), slug);

  if (!course) {
    return NextResponse.json({ error: "That course could not be found" }, { status: 404 });
  }

  return NextResponse.json({ course });
}

/** Joins or leaves a course. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const session = await auth();
  if (!(await getCurrentUser(session))) return unauthorized();

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Say whether to join or leave" }, { status: 422 });
  }

  if (parsed.data.action === "drop") {
    const dropped = await dropCourse(session, slug);
    if (!dropped) {
      return NextResponse.json({ error: "You are not enrolled in that course" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  const result = await enrollInCourse(session, slug, parsed.data.key);

  if (!result.ok) {
    if (result.reason === "missing") {
      return NextResponse.json({ error: "That course could not be found" }, { status: 404 });
    }
    if (result.reason === "inactive") {
      return NextResponse.json({ error: "That course is not currently offered" }, { status: 410 });
    }
    if (result.reason === "key_required") {
      return NextResponse.json({ error: "That course needs an enrolment key" }, { status: 403 });
    }
    return NextResponse.json({ error: "That enrolment key is not right" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, id: result.id }, { status: 201 });
}