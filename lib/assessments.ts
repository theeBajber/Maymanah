import "server-only";

import { db } from "./db";

export type QuestionKind = "MCQ" | "SHORT_ANSWER" | "ESSAY";

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: QuestionKind;
  options: { text: string }[];
  marks: number;
}

export interface AssessmentAnswer {
  questionId: string;
  selectedOption: number | null;
  answerText: string | null;
  isCorrect: boolean | null;
  score: number | null;
}

export interface AssessmentResult {
  status: "SUBMITTED" | "GRADED";
  totalScore: number | null;
  totalMarks: number;
  passed: boolean | null;
  answers: AssessmentAnswer[];
}

export interface Assessment {
  exam: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    passMark: number;
  };
  questions: AssessmentQuestion[];
  totalMarks: number;
  result: AssessmentResult | null;
}

/**
 * Strips the correctness marker from stored options.
 *
 * A learner answering a question must not be handed the answer, so the option
 * array is reduced to its text before it ever reaches the browser.
 */
function toQuestions(
  rows: {
    id: string;
    questionText: string;
    questionType: QuestionKind;
    options: unknown;
    marks: number;
  }[],
): AssessmentQuestion[] {
  return rows.map((row) => {
    const options = Array.isArray(row.options)
      ? row.options
          .map((option) =>
            option && typeof option === "object" && "text" in option
              ? { text: String((option as { text: unknown }).text) }
              : null,
          )
          .filter((option): option is { text: string } => option !== null)
      : [];

    return {
      id: row.id,
      questionText: row.questionText,
      questionType: row.questionType,
      options,
      marks: row.marks,
    };
  });
}

async function loadResult(
  examId: string,
  studentId: string,
  totalMarks: number,
  passMark: number,
): Promise<AssessmentResult | null> {
  const submission = await db.submission.findFirst({
    where: { examId, studentId, status: { in: ["SUBMITTED", "GRADED"] } },
    orderBy: { attemptNumber: "desc" },
    select: {
      status: true,
      totalScore: true,
      answers: {
        select: {
          questionId: true,
          selectedOption: true,
          answerText: true,
          isCorrect: true,
          score: true,
        },
      },
    },
  });
  if (!submission) return null;

  const graded = submission.status === "GRADED" && submission.totalScore !== null;
  const passed = graded && totalMarks > 0 ? ((submission.totalScore ?? 0) / totalMarks) * 100 >= passMark : null;

  return {
    status: submission.status as "SUBMITTED" | "GRADED",
    totalScore: submission.totalScore,
    totalMarks,
    passed,
    answers: submission.answers,
  };
}

/**
 * Loads the published quiz attached to a lesson, when one exists.
 *
 * Returns the questions (answers stripped) alongside the learner's latest
 * result, so the reader can show a completed quiz rather than restart it.
 */
export async function getLessonQuiz(studentId: string, lessonId: string): Promise<Assessment | null> {
  const exam = await db.exam.findFirst({
    where: { lessonId, examType: "QUIZ", isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      durationMinutes: true,
      passMark: true,
      questions: {
        orderBy: { orderIndex: "asc" },
        select: { id: true, questionText: true, questionType: true, options: true, marks: true },
      },
    },
  });
  if (!exam || exam.questions.length === 0) return null;

  const questions = toQuestions(exam.questions);
  const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);
  const result = await loadResult(exam.id, studentId, totalMarks, exam.passMark);

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      passMark: exam.passMark,
    },
    questions,
    totalMarks,
    result,
  };
}

/**
 * Loads the published final exam for a course, when one exists.
 *
 * Written answers can never be marked automatically, so an ungraded attempt
 * reports a null pass state rather than a guess.
 */
export async function getFinalExam(studentId: string, courseId: string): Promise<Assessment | null> {
  const exam = await db.exam.findFirst({
    where: { courseId, examType: "FINAL", isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      durationMinutes: true,
      passMark: true,
      questions: {
        orderBy: { orderIndex: "asc" },
        select: { id: true, questionText: true, questionType: true, options: true, marks: true },
      },
    },
  });
  if (!exam || exam.questions.length === 0) return null;

  const questions = toQuestions(exam.questions);
  const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);
  const result = await loadResult(exam.id, studentId, totalMarks, exam.passMark);

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      passMark: exam.passMark,
    },
    questions,
    totalMarks,
    result,
  };
}
