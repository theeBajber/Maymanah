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
  options: z.array(optionSchema).min(2).max(6),
});

const createExamSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  passMark: z.number().min(0).max(100),
  shuffleQuestions: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(questionSchema),
});

const updateExamSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  passMark: z.number().min(0).max(100).optional(),
  shuffleQuestions: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(questionSchema).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    const exam = await safeQuery(() =>
      prisma.exam.findFirst({
        where: { courseId: id, examType: "FINAL" },
        include: {
          questions: { orderBy: { orderIndex: "asc" } },
        },
      }),
    );

    return NextResponse.json(exam);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin exam fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = createExamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await safeQuery(() =>
      prisma.exam.findFirst({
        where: { courseId: id, examType: "FINAL" },
      }),
    );

    if (existing) {
      return NextResponse.json(
        { error: "Final exam already exists for this course" },
        { status: 409 },
      );
    }

    const { questions, ...examData } = parsed.data;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    const exam = await safeQuery(() =>
      prisma.$transaction(async (tx) => {
        return tx.exam.create({
          data: {
            ...examData,
            examType: "FINAL",
            totalMarks,
            courseId: id,
            isPublished: examData.isPublished ?? false,
            questions: {
              create: questions.map((q, idx) => ({
                questionText: q.questionText,
                questionType: "MCQ",
                marks: q.marks,
                options: q.options,
                orderIndex: idx,
              })),
            },
          },
          include: { questions: { orderBy: { orderIndex: "asc" } } },
        });
      }),
    );

    await logAuditEvent({
      action: "ADMIN_FINAL_EXAM_CREATED",
      userId: session.user.id,
      metadata: { courseId: id, examId: exam.id, title: exam.title },
    });

    revalidatePath(`/admin/courses/${id}/exam`);
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin exam create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateExamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await safeQuery(() =>
      prisma.exam.findFirst({
        where: { courseId: id, examType: "FINAL" },
        select: { id: true },
      }),
    );

    if (!existing) {
      return NextResponse.json({ error: "Final exam not found" }, { status: 404 });
    }

    const { questions, ...examData } = parsed.data;

    const exam = await safeQuery(() =>
      prisma.$transaction(async (tx) => {
        if (questions) {
          await tx.question.deleteMany({ where: { examId: existing.id } });
        }

        const totalMarks = questions
          ? questions.reduce((sum, q) => sum + q.marks, 0)
          : undefined;

        return tx.exam.update({
          where: { id: existing.id },
          data: {
            ...examData,
            ...(totalMarks !== undefined ? { totalMarks } : {}),
            ...(questions
              ? {
                  questions: {
                    create: questions.map((q, idx) => ({
                      questionText: q.questionText,
                      questionType: "MCQ",
                      marks: q.marks,
                      options: q.options,
                      orderIndex: idx,
                    })),
                  },
                }
              : {}),
          },
          include: { questions: { orderBy: { orderIndex: "asc" } } },
        });
      }),
    );

    await logAuditEvent({
      action: "ADMIN_FINAL_EXAM_UPDATED",
      userId: session.user.id,
      metadata: { courseId: id, examId: existing.id },
    });

    revalidatePath(`/admin/courses/${id}/exam`);
    return NextResponse.json(exam);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin exam update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const existing = await safeQuery(() =>
      prisma.exam.findFirst({
        where: { courseId: id, examType: "FINAL" },
        select: { id: true },
      }),
    );

    if (!existing) {
      return NextResponse.json({ error: "Final exam not found" }, { status: 404 });
    }

    await logAuditEvent({
      action: "ADMIN_FINAL_EXAM_DELETED",
      userId: session.user.id,
      metadata: { courseId: id, examId: existing.id },
    });

    await safeQuery(() => prisma.exam.delete({ where: { id: existing.id } }));

    revalidatePath(`/admin/courses/${id}/exam`);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin exam delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
