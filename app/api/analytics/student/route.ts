import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStudentExamPerformance, getStudentCourseProgress } from "@/lib/analytics";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [examPerformance, learningProgress] = await Promise.all([
      getStudentExamPerformance(session.user.id),
      getStudentCourseProgress(session.user.id),
    ]);

    return NextResponse.json({ examPerformance, learningProgress });
  } catch (error) {
    console.error("Student analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
