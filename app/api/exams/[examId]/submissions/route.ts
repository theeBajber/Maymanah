import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

type RouteContext = { params: Promise<{ examId: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { examId } = await params;

    const submissions = await safeQuery(() =>
      prisma.submission.findMany({
        where: { examId, studentId: session.user.id },
        orderBy: { attemptNumber: "desc" },
        include: {
          answers: {
            include: { question: true },
            orderBy: { answeredAt: "asc" },
          },
        },
      }),
    );
    return NextResponse.json(submissions);
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
      prisma.exam.findUnique({
        where: { id: examId },
        select: { id: true, examType: true, courseId: true },
      }),
    );
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const existing = await safeQuery(() =>
      prisma.submission.findFirst({
        where: { examId, studentId: session.user.id, status: "IN_PROGRESS" },
      }),
    );
    if (existing) return NextResponse.json(existing);

    let gradedCount = await safeQuery(() =>
      prisma.submission.count({
        where: { examId, studentId: session.user.id, status: "GRADED" },
      }),
    );

    if (exam.examType === "FINAL" && gradedCount >= 2) {
      const enrollment = await safeQuery(() =>
        prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.user.id, courseId: exam.courseId } },
          select: { passedAt: true },
        }),
      );

      // If the student hasn't passed the exam yet, old submissions
      // are stale (from a prior reset or failed cycle). Clear them.
      if (enrollment && !enrollment.passedAt) {
        await safeQuery(() =>
          prisma.submission.deleteMany({
            where: { examId, studentId: session.user.id },
          }),
        );
        gradedCount = 0;
      } else {
        return NextResponse.json(
          { error: "Maximum attempts reached. You must retake the course." },
          { status: 403 },
        );
      }
    }

    const attemptNumber = gradedCount + 1;

    const submission = await safeQuery(() =>
      prisma.submission.create({
        data: { examId, studentId: session.user.id, attemptNumber },
      }),
    );
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Submission start error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
