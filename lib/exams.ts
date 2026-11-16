import "server-only";

import { courseCompletion } from "./completion";
import { db } from "./db";
import { getCurrentUser, type SessionLike } from "./session";

/**
 * Whether a mark clears an exam's pass mark.
 *
 * `passMark` is a percentage, not a raw score: an exam worth two marks and one
 * worth a hundred both use the same threshold. Keeping the rule here means the
 * submission, the result view, and the course page cannot drift apart.
 */
export function didPassExam(
  totalScore: number | null,
  totalMarks: number,
  passMark: number,
): boolean {
  if (totalScore === null || totalMarks <= 0) return false;
  return (totalScore / totalMarks) * 100 >= passMark;
}

/**
 * Grading for choice questions, done at submission time.
 *
 * A choice answer is marked immediately against the stored correct index.
 * Written answers cannot be marked by the shape of their text, so they wait
 * for a human marker with no score rather than receiving an invented one.
 */
export interface GradedAnswer {
  questionId: string;
  selectedOption?: number;
  answerText?: string;
  isCorrect: boolean | null;
  score: number | null;
}

export function gradeChoice(
  options: unknown,
  correctAnswer: string | null,
  selectedOption: number | undefined,
  marks: number,
): { isCorrect: boolean; score: number } {
  if (!Array.isArray(options) || selectedOption === undefined) {
    return { isCorrect: false, score: 0 };
  }

  const correctIndex = correctAnswer === null ? Number.NaN : Number(correctAnswer);
  const isCorrect =
    Number.isInteger(correctIndex) &&
    Number.isInteger(selectedOption) &&
    selectedOption >= 0 &&
    selectedOption < options.length &&
    selectedOption === correctIndex;

  return { isCorrect, score: isCorrect ? marks : 0 };
}

export type SubmissionFailure =
  | "missing"
  | "not_enrolled"
  | "not_complete"
  | "closed"
  | "already_submitted";

export interface SubmissionResult {
  id: string;
  totalScore: number | null;
  graded: boolean;
  attemptNumber: number;
}

/**
 * Submits answers for an exam attempt.
 *
 * Starts a new attempt row per submission rather than reusing one, so a retake
 * never overwrites the earlier attempt. Choice questions are marked at once;
 * a submission containing only written answers stays ungraded with no score
 * until a marker reads it.
 */
export async function submitExam(
  session: SessionLike | null,
  examId: string,
  answers: { questionId: string; selectedOption?: number; answerText?: string }[],
): Promise<{ ok: true; result: SubmissionResult } | { ok: false; reason: SubmissionFailure }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("submitExam requires a signed-in user");

  const exam = await db.exam.findUnique({
    where: { id: examId },
    select: {
      id: true,
      courseId: true,
      isPublished: true,
      examType: true,
      passMark: true,
      totalMarks: true,
      startTime: true,
      endTime: true,
      course: { select: { isPublished: true, slug: true } },
      questions: { select: { id: true, questionType: true, options: true, correctAnswer: true, marks: true } },
    },
  });

  if (!exam || !exam.isPublished || !exam.course.isPublished) return { ok: false, reason: "missing" };

  const now = Date.now();
  if (exam.startTime && exam.startTime.getTime() > now) return { ok: false, reason: "closed" };
  if (exam.endTime && exam.endTime.getTime() <= now) return { ok: false, reason: "closed" };

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: exam.courseId } },
    select: { status: true, completedAt: true },
  });
  // Finishing every lesson already marks an enrolment complete, so the final
  // exam has to accept a completed learner; only a dropped or pending one is
  // turned away.
  const enrolled = enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED";
  if (!enrolled) return { ok: false, reason: "not_enrolled" };

  // The final exam is the step after the course, not a shortcut past it. The
  // page hides it until the course is finished; this repeats the rule at the
  // endpoint so a direct request cannot skip the work. "Finished" is the
  // course's own rule, so a memorisation course is not held to its hidden
  // lesson list.
  if (exam.examType === "FINAL") {
    const completion = await courseCompletion(user.id, {
      id: exam.courseId,
      slug: exam.course.slug,
    });
    if (!completion.completed) {
      return { ok: false, reason: "not_complete" };
    }
  }

  const previous = await db.submission.findMany({
    where: { examId, studentId: user.id },
    orderBy: { attemptNumber: "desc" },
    take: 1,
    select: { attemptNumber: true, status: true },
  });

  if (previous[0]?.status === "IN_PROGRESS") {
    return { ok: false, reason: "already_submitted" };
  }

  const byId = new Map(exam.questions.map((question) => [question.id, question]));
  const totalMarks = exam.questions.reduce((sum, question) => sum + question.marks, 0);
  let totalScore = 0;
  let hasWritten = false;
  const graded: GradedAnswer[] = [];

  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (!question) continue;

    if (question.questionType === "MCQ") {
      const { isCorrect, score } = gradeChoice(question.options, question.correctAnswer, answer.selectedOption, question.marks);
      totalScore += score;
      graded.push({ questionId: question.id, selectedOption: answer.selectedOption, isCorrect, score });
    } else {
      hasWritten = true;
      graded.push({ questionId: question.id, answerText: answer.answerText, isCorrect: null, score: null });
    }
  }

  const submission = await db.submission.create({
    data: {
      examId,
      studentId: user.id,
      status: hasWritten ? "SUBMITTED" : "GRADED",
      totalScore: hasWritten ? null : totalScore,
      attemptNumber: (previous[0]?.attemptNumber ?? 0) + 1,
      submittedAt: new Date(),
      answers: {
        create: graded.map((row) => ({
          questionId: row.questionId,
          answerText: row.answerText,
          selectedOption: row.selectedOption,
          isCorrect: row.isCorrect,
          score: row.score,
        })),
      },
    },
    select: { id: true },
  });

  // Passing the final exam records the pass and finishes the enrolment. The
  // certificate is deliberately not issued here: the student reviews the
  // course first, and the review endpoint issues it.
  if (
    !hasWritten &&
    exam.examType === "FINAL" &&
    didPassExam(totalScore, totalMarks, exam.passMark)
  ) {
    const now = new Date();
    await db.enrollment.updateMany({
      where: { userId: user.id, courseId: exam.courseId, status: { in: ["ACTIVE", "COMPLETED"] } },
      data: {
        status: "COMPLETED",
        completedAt: enrollment.completedAt ?? now,
        passedAt: now,
      },
    });
  }

  return {
    ok: true,
    result: {
      id: submission.id,
      totalScore: hasWritten ? null : totalScore,
      graded: !hasWritten,
      attemptNumber: (previous[0]?.attemptNumber ?? 0) + 1,
    },
  };
}
