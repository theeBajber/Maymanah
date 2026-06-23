import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["Quran", "Fiqh", "History", "Arabic", "Aqeedah"]),
  image: z.string().optional(),
  enrollmentKey: z.string().optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();

    const courses = await safeQuery(() =>
      prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { lessons: true, enrollments: true } },
        },
      }),
    );

    return NextResponse.json(courses);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin courses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const course = await safeQuery(() =>
      prisma.course.create({
        data: {
          ...parsed.data,
          enrollmentKey: parsed.data.enrollmentKey === "" ? null : parsed.data.enrollmentKey,
        },
      }),
    );

    await logAuditEvent({
      action: "ADMIN_COURSE_CREATED",
      userId: session.user.id,
      metadata: { courseId: course.id, title: course.title },
    });

    revalidatePath("/courses");
    revalidatePath("/admin/courses");

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin course create error:", error);
    const message =
      error instanceof Error && "code" in error && error.code === "P2002"
        ? "A course with this slug or enrollment key already exists"
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
