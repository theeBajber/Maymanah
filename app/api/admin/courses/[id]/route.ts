import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z
    .enum(["Quran", "Fiqh", "History", "Arabic", "Aqeedah"])
    .optional(),
  image: z.string().optional(),
  enrollmentKey: z.string().optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    const course = await safeQuery(() =>
      prisma.course.findUnique({
        where: { id },
        include: {
          _count: { select: { lessons: true, enrollments: true } },
        },
      }),
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin course fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = {
      ...parsed.data,
      enrollmentKey: parsed.data.enrollmentKey === "" ? null : parsed.data.enrollmentKey,
    };

    const course = await safeQuery(() =>
      prisma.course.update({
        where: { id },
        data,
      }),
    );

    await logAuditEvent({
      action: "ADMIN_COURSE_UPDATED",
      userId: session.user.id,
      metadata: { courseId: id },
    });

    revalidatePath("/courses");
    revalidatePath("/admin/courses");

    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin course update error:", error);
    const message =
      error instanceof Error && "code" in error && error.code === "P2002"
        ? "A course with this slug or enrollment key already exists"
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    await logAuditEvent({
      action: "ADMIN_COURSE_DELETED",
      userId: session.user.id,
      metadata: { courseId: id },
    });

    await safeQuery(() => prisma.course.delete({ where: { id } }));

    revalidatePath("/courses");
    revalidatePath("/admin/courses");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin course delete error:", error);
    const message =
      error instanceof Error && "code" in error && error.code === "P2025"
        ? "Course not found"
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
