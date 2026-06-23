import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

type RouteContext = { params: Promise<{ examId: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { examId } = await params;

    const exam = await safeQuery(() =>
      prisma.exam.findUnique({
        where: { id: examId },
        select: { id: true },
      }),
    );
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const questions = await safeQuery(() =>
      prisma.question.findMany({
        where: { examId },
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          examId: true,
          questionText: true,
          questionType: true,
          options: true,
          marks: true,
          difficulty: true,
          orderIndex: true,
        },
      }),
    );
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Questions list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
