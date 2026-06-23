import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

type RouteContext = { params: Promise<{ submissionId: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { submissionId } = await params;

    const submission = await safeQuery(() =>
      prisma.submission.findUnique({ where: { id: submissionId } }),
    );
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (submission.studentId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (submission.status !== "IN_PROGRESS") return NextResponse.json({ error: "Already finalized" }, { status: 400 });

    const body = await req.json();
    const answer = await safeQuery(() =>
      prisma.answer.upsert({
        where: {
          submissionId_questionId: {
            submissionId,
            questionId: body.questionId,
          },
        },
        create: {
          submissionId,
          questionId: body.questionId,
          answerText: body.answerText || null,
          selectedOption: body.selectedOption ?? null,
        },
        update: {
          answerText: body.answerText || null,
          selectedOption: body.selectedOption ?? null,
          answeredAt: new Date(),
        },
      }),
    );
    return NextResponse.json(answer);
  } catch (error) {
    console.error("Answer submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
