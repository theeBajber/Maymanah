import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const reorderSchema = z.object({
  lessonIds: z.array(z.string()),
});

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id: courseId } = await params;

    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await safeQuery(() =>
      prisma.$transaction(async (tx) => {
        for (let i = 0; i < parsed.data.lessonIds.length; i++) {
          await tx.lesson.update({
            where: { id: parsed.data.lessonIds[i], courseId },
            data: { order: i },
          });
        }
      }),
    );

    revalidatePath(`/courses`);
    revalidatePath(`/admin/courses/${courseId}/lessons`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Lesson reorder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
