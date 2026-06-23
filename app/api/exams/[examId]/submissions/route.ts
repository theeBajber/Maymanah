import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

type RouteContext = { params: Promise<{ examId: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { examId } = await params;

    const submission = await safeQuery(() =>
      prisma.submission.findUnique({
        where: { examId_studentId: { examId, studentId: session.user.id } },
        include: {
          answers: {
            include: { question: true },
            orderBy: { answeredAt: "asc" },
          },
        },
      }),
    );
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { examId } = await params;

    const exam = await safeQuery(() =>
      prisma.exam.findUnique({ where: { id: examId }, select: { id: true } }),
    );
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const existing = await safeQuery(() =>
      prisma.submission.findUnique({
        where: { examId_studentId: { examId, studentId: session.user.id } },
      }),
    );
    if (existing) return NextResponse.json(existing);

    const submission = await safeQuery(() =>
      prisma.submission.create({
        data: { examId, studentId: session.user.id },
      }),
    );
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Submission start error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
