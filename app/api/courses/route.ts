import { NextResponse } from "next/server";
import { getCoursesData } from "@/lib/courses";

export async function GET() {
  try {
    const data = await getCoursesData();

    if (!data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}