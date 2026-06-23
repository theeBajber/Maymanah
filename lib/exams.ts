import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

export async function getCourseExams(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return safeQuery(() =>
    prisma.exam.findMany({
      where: { courseId, isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
        lesson: { select: { id: true, title: true, order: true } },
        submissions: {
          where: { studentId: session.user.id },
          select: {
            id: true,
            status: true,
            totalScore: true,
            startedAt: true,
            submittedAt: true,
          },
          take: 1,
        },
      },
    }),
  );
}

export async function getLessonExam(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const exam = await safeQuery(() =>
    prisma.exam.findUnique({
      where: { lessonId },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        submissions: {
          where: { studentId: session.user.id },
          include: { answers: true },
          take: 1,
        },
      },
    }),
  );

  return exam;
}

export async function getExamResults(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return safeQuery(() =>
    prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        exam: {
          include: {
            questions: { orderBy: { orderIndex: "asc" } },
            course: { select: { id: true, title: true, slug: true } },
          },
        },
        answers: {
          include: { question: true },
          orderBy: { answeredAt: "asc" },
        },
      },
    }),
  );
}

export async function gradeExam(submissionId: string) {
  const submission = await safeQuery(() =>
    prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        answers: true,
        exam: { include: { questions: true } },
      },
    }),
  );

  if (!submission || submission.status === "GRADED") return submission;

  let totalScore = 0;
  for (const answer of submission.answers) {
    const question = submission.exam.questions.find(
      (q) => q.id === answer.questionId,
    );
    if (!question) continue;

    if (question.questionType === "MCQ" && answer.selectedOption != null) {
      const options = question.options as Array<{
        text: string;
        isCorrect?: boolean;
      }>;
      const isCorrect = options[answer.selectedOption]?.isCorrect ?? false;
      const score = isCorrect ? question.marks : 0;
      await safeQuery(() =>
        prisma.answer.update({
          where: { id: answer.id },
          data: { isCorrect, score },
        }),
      );
      if (isCorrect) totalScore += question.marks;
    } else if (question.questionType === "SHORT_ANSWER") {
      const isCorrect =
        answer.answerText?.trim().toLowerCase() ===
        question.correctAnswer?.trim().toLowerCase();
      const score = isCorrect ? question.marks : 0;
      await safeQuery(() =>
        prisma.answer.update({
          where: { id: answer.id },
          data: { isCorrect, score },
        }),
      );
      if (isCorrect) totalScore += question.marks;
    }
  }

  return safeQuery(() =>
    prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: "GRADED",
        totalScore,
      },
    }),
  );
}
