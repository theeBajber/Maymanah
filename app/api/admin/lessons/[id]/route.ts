import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  questionText: z.string().min(1),
  marks: z.number().int().positive(),
  options: z.array(optionSchema).length(4),
});

const examSchema = z.object({
  title: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  passMark: z.number().min(0).max(100),
  totalMarks: z.number().optional(),
  questions: z.array(questionSchema),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  order: z.number().int().min(0).optional(),
  duration: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  exam: examSchema.optional().nullable(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    const lesson = await safeQuery(() =>
      prisma.lesson.findUnique({
        where: { id },
        include: {
          course: { select: { id: true, title: true, slug: true } },
          exam: {
            include: {
              questions: {
                orderBy: { orderIndex: "asc" },
                select: {
                  id: true,
                  questionText: true,
                  questionType: true,
                  marks: true,
                  options: true,
                  orderIndex: true,
                },
              },
            },
          },
        },
      }),
    );

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin lesson fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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

    const lesson = await safeQuery(() =>
      prisma.lesson.findUnique({ where: { id }, select: { courseId: true } }),
    );

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const { exam, ...lessonData } = parsed.data;

    const updated = await safeQuery(() =>
      prisma.$transaction(async (tx) => {
        const lsn = await tx.lesson.update({
          where: { id },
          data: lessonData,
        });

        const existingExam = await tx.exam.findUnique({
          where: { lessonId: id },
          select: { id: true },
        });

        if (exam) {
          const totalMarks =
            exam.totalMarks ||
            exam.questions.reduce((sum, q) => sum + q.marks, 0);
          if (existingExam) {
            await tx.question.deleteMany({
              where: { examId: existingExam.id },
            });
            await tx.exam.update({
              where: { lessonId: id },
              data: {
                title: exam.title,
                durationMinutes: exam.durationMinutes,
                passMark: exam.passMark,
                totalMarks,
                questions: {
                  create: exam.questions.map((q, idx) => ({
                    questionText: q.questionText,
                    questionType: "MCQ",
                    marks: q.marks,
                    options: q.options,
                    orderIndex: idx,
                  })),
                },
              },
            });
          } else {
            await tx.exam.create({
              data: {
                title: exam.title,
                durationMinutes: exam.durationMinutes,
                passMark: exam.passMark,
                totalMarks,
                courseId: lesson.courseId,
                lessonId: id,
                isPublished: true,
                questions: {
                  create: exam.questions.map((q, idx) => ({
                    questionText: q.questionText,
                    questionType: "MCQ",
                    marks: q.marks,
                    options: q.options,
                    orderIndex: idx,
                  })),
                },
              },
            });
          }
        } else if (existingExam) {
          await tx.question.deleteMany({
            where: { examId: existingExam.id },
          });
          await tx.exam.delete({ where: { lessonId: id } });
        }

        return lsn;
      }),
    );

    await logAuditEvent({
      action: "ADMIN_LESSON_UPDATED",
      userId: session.user.id,
      metadata: { courseId: lesson.courseId, lessonId: id },
    });

    revalidatePath(`/courses`);
    revalidatePath(`/admin/courses/${lesson.courseId}/lessons`);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin lesson update error:", error);
    const message =
      error instanceof Error && "code" in error && error.code === "P2002"
        ? "A lesson with this title already exists"
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const lesson = await safeQuery(() =>
      prisma.lesson.findUnique({ where: { id }, select: { courseId: true } }),
    );

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await logAuditEvent({
      action: "ADMIN_LESSON_DELETED",
      userId: session.user.id,
      metadata: { courseId: lesson.courseId, lessonId: id },
    });

    await safeQuery(() => prisma.lesson.delete({ where: { id } }));

    revalidatePath(`/courses`);
    revalidatePath(`/admin/courses/${lesson.courseId}/lessons`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin lesson delete error:", error);
    const message =
      error instanceof Error && "code" in error && error.code === "P2025"
        ? "Lesson not found"
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
