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

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  order: z.number().int().min(0),
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

    const lessons = await safeQuery(() =>
      prisma.lesson.findMany({
        where: { courseId: id },
        orderBy: { order: "asc" },
        include: {
          _count: { select: { lessonProgress: true } },
        },
      }),
    );

    return NextResponse.json(lessons);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin lessons fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { exam, ...lessonData } = parsed.data;

    const lesson = await safeQuery(() =>
      prisma.$transaction(async (tx) => {
        const lsn = await tx.lesson.create({
          data: {
            ...lessonData,
            courseId: id,
          },
        });

        if (exam) {
          const totalMarks =
            exam.totalMarks ||
            exam.questions.reduce((sum, q) => sum + q.marks, 0);
          await tx.exam.create({
            data: {
              title: exam.title,
              durationMinutes: exam.durationMinutes,
              passMark: exam.passMark,
              totalMarks,
              courseId: id,
              lessonId: lsn.id,
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

        return lsn;
      }),
    );

    await logAuditEvent({
      action: "ADMIN_LESSON_CREATED",
      userId: session.user.id,
      metadata: { courseId: id, lessonId: lesson.id, title: lesson.title },
    });

    revalidatePath(`/courses`);
    revalidatePath(`/admin/courses/${id}/lessons`);

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin lesson create error:", error);
    const message =
      error instanceof Error && "code" in error && error.code === "P2002"
        ? "A lesson with this title already exists"
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
