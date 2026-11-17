import { describe, expect, it } from "vitest";

import {
  choiceOptionsFromEditor,
  choiceProblemMessage,
  correctAnswerFromStored,
  correctOptionIndex,
  normalizeExamQuestions,
  optionsForEditor,
  storedOptionTexts,
} from "./question-options";

const four = (correct: number) =>
  ["Alif", "Ba", "Ta", "Tha"].map((text, index) => ({
    text,
    isCorrect: index === correct,
  }));

describe("correctOptionIndex", () => {
  it("finds the one ticked option", () => {
    expect(correctOptionIndex(four(2))).toBe(2);
  });

  it("refuses no tick or two ticks", () => {
    expect(correctOptionIndex(["a", "b"].map((text) => ({ text, isCorrect: false })))).toBeNull();
    expect(
      correctOptionIndex([
        { isCorrect: true },
        { isCorrect: true },
      ]),
    ).toBeNull();
  });
});

describe("choiceOptionsFromEditor", () => {
  it("stores text-only options and the answer index", () => {
    expect(choiceOptionsFromEditor(four(1))).toEqual({
      ok: true,
      options: [{ text: "Alif" }, { text: "Ba" }, { text: "Ta" }, { text: "Tha" }],
      correctAnswer: "1",
    });
  });

  it("reports a question with no correct answer", () => {
    const options = four(0).map((option) => ({ ...option, isCorrect: false }));
    expect(choiceOptionsFromEditor(options)).toEqual({ ok: false, problem: "no_correct" });
  });

  it("reports a question with more than one correct answer", () => {
    const options = four(0).map((option) => ({ ...option, isCorrect: true }));
    expect(choiceOptionsFromEditor(options)).toEqual({
      ok: false,
      problem: "multiple_correct",
    });
  });

  it("never stores a question with no options", () => {
    expect(choiceOptionsFromEditor([])).toEqual({ ok: false, problem: "no_correct" });
  });
});

describe("normalizeExamQuestions", () => {
  it("converts every question and keeps marks", () => {
    const result = normalizeExamQuestions([
      { questionText: "First", marks: 1, options: four(0) },
      { questionText: "Second", marks: 3, options: four(3) },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.questions.map((question) => question.correctAnswer)).toEqual(["0", "3"]);
    expect(result.questions[1].marks).toBe(3);
  });

  it("names the first unusable question", () => {
    const result = normalizeExamQuestions([
      { questionText: "Fine", marks: 1, options: four(0) },
      {
        questionText: "Broken",
        marks: 1,
        options: four(1).map((option) => ({ ...option, isCorrect: false })),
      },
    ]);

    expect(result).toEqual({ ok: false, questionIndex: 1, problem: "no_correct" });
  });
});

describe("correctAnswerFromStored", () => {
  it("keeps a valid stored answer", () => {
    expect(correctAnswerFromStored([{ text: "a" }, { text: "b" }], "1")).toBe("1");
  });

  it("recovers the answer from legacy option markers", () => {
    expect(
      correctAnswerFromStored(
        [
          { text: "a", isCorrect: false },
          { text: "b", isCorrect: true },
          { text: "c", isCorrect: false },
          { text: "d", isCorrect: false },
        ],
        null,
      ),
    ).toBe("1");
  });

  it("does not guess when no option or several options are marked", () => {
    expect(correctAnswerFromStored([{ text: "a", isCorrect: false }], null)).toBeNull();
    expect(
      correctAnswerFromStored(
        [
          { text: "a", isCorrect: true },
          { text: "b", isCorrect: true },
        ],
        null,
      ),
    ).toBeNull();
  });

  it("ignores an answer pointing past the end of the options", () => {
    expect(correctAnswerFromStored([{ text: "a" }, { text: "b" }], "9")).toBeNull();
  });
});

describe("optionsForEditor", () => {
  it("ticks the stored answer rather than the legacy marker", () => {
    expect(
      optionsForEditor(
        [
          { text: "a", isCorrect: true },
          { text: "b", isCorrect: false },
        ],
        "1",
      ),
    ).toEqual([
      { text: "a", isCorrect: false },
      { text: "b", isCorrect: true },
    ]);
  });

  it("shows an empty option list without throwing", () => {
    expect(optionsForEditor(null, null)).toEqual([]);
    expect(storedOptionTexts([{}])).toEqual([]);
  });
});

describe("choiceProblemMessage", () => {
  it("explains both failures", () => {
    expect(choiceProblemMessage("no_correct")).toMatch(/needs a correct answer/);
    expect(choiceProblemMessage("multiple_correct")).toMatch(/only one/);
  });
});
