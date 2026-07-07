import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

// Fisher-Yates shuffle with optional seed for deterministic randomization per user
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 1) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getShuffleSeed(userId: string, examId: string): number {
  let hash = 0;
  const str = `${userId}-${examId}`;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function getShuffledQuestions(examId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const questions = await safeQuery(() =>
    prisma.question.findMany({
      where: { examId },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        questionText: true,
        questionType: true,
        options: true,
        marks: true,
        difficulty: true,
        orderIndex: true,
      },
    }),
  );

  if (!questions) return [];

  const seed = getShuffleSeed(session.user.id, examId);

  return seededShuffle(questions, seed).map((q) => {
    if (q.questionType === "MCQ" && Array.isArray(q.options)) {
      const opts = q.options as Array<{ text: string; isCorrect: boolean }>;
      return { ...q, options: seededShuffle(opts, seed + 1) };
    }
    return q;
  });
}

export async function getCourseFinalExam(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return safeQuery(() =>
    prisma.exam.findFirst({
      where: { courseId, examType: "FINAL", isPublished: true },
      include: {
        _count: { select: { questions: true } },
        submissions: {
          where: { studentId: session.user.id },
          orderBy: { attemptNumber: "desc" },
          include: {
            answers: {
              include: { question: true },
              orderBy: { answeredAt: "asc" },
            },
          },
          take: 2,
        },
      },
    }),
  );
}

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
          orderBy: { attemptNumber: "desc" },
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

  const seed = getShuffleSeed(submission.studentId, submission.examId);

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
      const gradedOptions = submission.exam.shuffleQuestions
        ? seededShuffle(options, seed + 1)
        : options;
      const isCorrect = gradedOptions[answer.selectedOption]?.isCorrect ?? false;
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

  const graded = await safeQuery(() =>
    prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: "GRADED",
        totalScore,
      },
    }),
  );

  const xp = Math.round((totalScore / (submission.exam.totalMarks ?? 1)) * 10);
  await safeQuery(() =>
    prisma.user.update({
      where: { id: graded.studentId },
      data: { xp: { increment: xp } },
    }),
  );

  return graded;
}

export async function canRetakeExam(examId: string, userId: string): Promise<boolean> {
  const submissions = await safeQuery(() =>
    prisma.submission.findMany({
      where: { examId, studentId: userId, status: "GRADED" },
      orderBy: { attemptNumber: "desc" },
      select: { attemptNumber: true, totalScore: true },
    }),
  );

  if (submissions.length === 0) return true;
  const lastAttempt = submissions[0];
  if (lastAttempt.attemptNumber >= 2) return false;
  return true;
}

export async function passFinalExam(submissionId: string) {
  const submission = await safeQuery(() =>
    prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        exam: { select: { courseId: true, passMark: true, totalMarks: true } },
      },
    }),
  );

  if (!submission || !submission.totalScore) return;
  const pct = (submission.exam.totalMarks ?? 1) > 0
    ? (submission.totalScore / (submission.exam.totalMarks ?? 1)) * 100
    : 0;
  if (pct < (submission.exam.passMark ?? 50)) return;

  const userId = submission.studentId;
  const courseId = submission.exam.courseId;

  await safeQuery(() =>
    prisma.enrollment.updateMany({
      where: { userId, courseId },
      data: { passedAt: new Date() },
    }),
  );

  const [completedCount, totalLessons] = await Promise.all([
    safeQuery(() =>
      prisma.lessonProgress.count({
        where: {
          studentId: userId,
          lesson: { courseId },
          completed: true,
        },
      }),
    ),
    safeQuery(() =>
      prisma.lesson.count({
        where: { courseId, isPublished: true },
      }),
    ),
  ]);

  if (completedCount >= totalLessons) {
    await safeQuery(() =>
      prisma.enrollment.updateMany({
        where: { userId, courseId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          progress: 100,
        },
      }),
    );

    await safeQuery(() =>
      prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 20 } },
      }),
    );
  }

  const { issueCertificate } = await import("@/lib/certificate");
  await issueCertificate(userId, courseId);
}

export async function resetCourseProgress(courseId: string, userId: string) {
  await safeQuery(() =>
    prisma.lessonProgress.deleteMany({
      where: { studentId: userId, lesson: { courseId } },
    }),
  );

  const examIds = await safeQuery(() =>
    prisma.exam.findMany({
      where: { courseId },
      select: { id: true },
    }),
  );

  await safeQuery(() =>
    prisma.submission.deleteMany({
      where: { studentId: userId, examId: { in: examIds.map((e) => e.id) } },
    }),
  );

  await safeQuery(() =>
    prisma.enrollment.updateMany({
      where: { userId, courseId },
      data: { progress: 0, passedAt: null, status: "ACTIVE" },
    }),
  );
}
