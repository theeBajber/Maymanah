import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { listCourses } from "@/lib/courses";

/** Published, active courses with the reader's progress on each. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ courses: await listCourses(await auth()) });
}
