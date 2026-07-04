import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin";
import { parseCourseBook, saveImportedLessons } from "@/lib/course-import";

export const maxDuration = 300;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const course = await safeQuery(() =>
      prisma.course.findUnique({ where: { id }, select: { id: true } }),
    );
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existingLessons = await safeQuery(() =>
      prisma.lesson.count({ where: { courseId: id } }),
    );
    if (existingLessons > 0) {
      return NextResponse.json(
        {
          error:
            "This course already has lessons. Import book is only available for courses with no existing lessons.",
        },
        { status: 409 },
      );
    }

    const formData = await req.formData();
    const action = formData.get("action") as string | null;
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File exceeds 50MB maximum size" },
        { status: 400 },
      );
    }

    const allowedExtensions = ["pdf", "docx", "txt", "md"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type (.${ext}). Accepted: PDF, DOCX, TXT`,
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (action === "save") {
      const lessonsRaw = formData.get("lessons") as string | null;
      if (!lessonsRaw) {
        return NextResponse.json(
          { error: "No lesson data provided for save" },
          { status: 400 },
        );
      }

      const lessons = JSON.parse(lessonsRaw);
      const created = await saveImportedLessons(id, lessons, session.user.id);

      return NextResponse.json({ lessons: created });
    }

    const preview = await parseCourseBook(buffer, file.name);

    return NextResponse.json({ lessons: preview });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. The content may be too complex. Try a different file." },
        { status: 422 },
      );
    }

    console.error("Course import error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
