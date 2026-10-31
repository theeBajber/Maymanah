import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { listCourses } from "@/lib/courses";

/** Published courses with enrolment availability and the reader's progress. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ courses: await listCourses(await auth()) });
}
