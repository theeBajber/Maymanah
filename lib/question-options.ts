/**
 * How a multiple-choice question moves between the admin editor and the table.
 *
 * The editor asks for four options with a tick on the right one; grading needs
 * a single index in `correctAnswer`. Those two shapes drifted apart once — the
 * routes stored the ticks but never the answer, so every admin-made quiz graded
 * zero. This module is the only place that conversion happens, and it refuses
 * a question that has no single right answer rather than storing one that can
 * never be marked correct.
 */
export interface EditedChoiceOption {
  text: string;
  isCorrect: boolean;
}

export interface EditedQuestion {
  questionText: string;
  marks: number;
  options: EditedChoiceOption[];
}

export interface StoredQuestion {
  questionText: string;
  marks: number;
  options: { text: string }[];
  correctAnswer: string;
}

export type ChoiceProblem = "no_correct" | "multiple_correct";

export type ChoiceOptionsResult =
  | { ok: true; options: { text: string }[]; correctAnswer: string }
  | { ok: false; problem: ChoiceProblem };

export type ExamQuestionsResult =
  | { ok: true; questions: StoredQuestion[] }
  | { ok: false; questionIndex: number; problem: ChoiceProblem };

/** The index of the one option marked correct, or null when that is ambiguous. */
export function correctOptionIndex(options: readonly { isCorrect?: boolean }[]): number | null {
  const marked: number[] = [];
  options.forEach((option, index) => {
    if (option.isCorrect === true) marked.push(index);
  });
  return marked.length === 1 ? marked[0] : null;
}

/**
 * Converts editor options into stored options plus the answer index.
 *
 * Correctness is stripped from the stored options so the quiz payload can be
 * sent to a learner without leaking the answer; `correctAnswer` is the single
 * copy of that fact.
 */
export function choiceOptionsFromEditor(
  options: readonly EditedChoiceOption[],
): ChoiceOptionsResult {
  if (options.length === 0) return { ok: false, problem: "no_correct" };

  const marked = options.filter((option) => option.isCorrect).length;
  if (marked === 0) return { ok: false, problem: "no_correct" };
  if (marked > 1) return { ok: false, problem: "multiple_correct" };

  return {
    ok: true,
    options: options.map((option) => ({ text: option.text })),
    correctAnswer: String(options.findIndex((option) => option.isCorrect)),
  };
}

/** Normalises every question in an exam, naming the first one that is unusable. */
export function normalizeExamQuestions(
  questions: readonly EditedQuestion[],
): ExamQuestionsResult {
  const stored: StoredQuestion[] = [];

  for (const [index, question] of questions.entries()) {
    const converted = choiceOptionsFromEditor(question.options);
    if (!converted.ok) {
      return { ok: false, questionIndex: index, problem: converted.problem };
    }

    stored.push({
      questionText: question.questionText,
      marks: question.marks,
      options: converted.options,
      correctAnswer: converted.correctAnswer,
    });
  }

  return { ok: true, questions: stored };
}

/**
 * The answer a stored question already records, or one recovered from legacy
 * option markers.
 *
 * Rows written before the conversion existed keep `isCorrect` in the option
 * array and leave `correctAnswer` empty. Recovery is deliberately strict: two
 * ticks is as unusable as none, and the caller is told rather than guessed at.
 */
export function correctAnswerFromStored(
  options: unknown,
  correctAnswer: string | null,
): string | null {
  const list = Array.isArray(options) ? options : [];
  const stored =
    correctAnswer !== null && correctAnswer.trim() !== "" && Number.isInteger(Number(correctAnswer))
      ? Number(correctAnswer)
      : null;

  if (stored !== null && stored >= 0 && stored < list.length) {
    return String(stored);
  }

  const marked = correctOptionIndex(
    list.map((option) =>
      option && typeof option === "object" ? (option as { isCorrect?: boolean }) : {},
    ),
  );

  return marked === null ? null : String(marked);
}

/** Text-only options, safe to hand to a learner. */
export function storedOptionTexts(options: unknown): { text: string }[] {
  if (!Array.isArray(options)) return [];

  return options
    .map((option) => {
      if (!option || typeof option !== "object" || !("text" in option)) return null;
      return { text: String((option as { text: unknown }).text) };
    })
    .filter((option): option is { text: string } => option !== null);
}

/**
 * The shape the admin editor expects when it reopens a saved question.
 *
 * Without this the editor sees the raw option array, with no tick anywhere,
 * which is how re-saving a seeded quiz used to erase its answers.
 */
export function optionsForEditor(
  options: unknown,
  correctAnswer: string | null,
): EditedChoiceOption[] {
  const texts = storedOptionTexts(options);
  const answer = correctAnswerFromStored(options, correctAnswer);

  return texts.map((option, index) => ({
    text: option.text,
    isCorrect: answer !== null && Number(answer) === index,
  }));
}

/** The message shown when a question cannot be saved. */
export function choiceProblemMessage(problem: ChoiceProblem): string {
  return problem === "multiple_correct"
    ? "Each question can have only one correct answer."
    : "Each question needs a correct answer.";
}
