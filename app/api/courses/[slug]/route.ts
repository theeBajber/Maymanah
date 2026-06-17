import { NextRequest, NextResponse } from "next/server";
import { dropCourse, enrollCourse, getCourseBySlug } from "@/lib/courses";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Course detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const action = body?.action;

    let course;
    if (action === "enroll") {
      course = await enrollCourse(slug);
    } else if (action === "drop") {
      course = await dropCourse(slug);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'enroll' or 'drop'" },
        { status: 400 },
      );
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Course action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
