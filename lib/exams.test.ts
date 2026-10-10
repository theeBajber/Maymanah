import { describe, expect, it } from "vitest";

import { gradeChoice } from "./exams";

const OPTIONS = ["Mecca", "Medina", "Jerusalem", "Cairo"];

describe("gradeChoice", () => {
  it("marks the correct index full marks", () => {
    expect(gradeChoice(OPTIONS, "1", 1, 5)).toEqual({ isCorrect: true, score: 5 });
  });

  it("marks any other index zero", () => {
    expect(gradeChoice(OPTIONS, "1", 0, 5)).toEqual({ isCorrect: false, score: 0 });
    expect(gradeChoice(OPTIONS, "1", 3, 5)).toEqual({ isCorrect: false, score: 0 });
  });

  it("rejects an out-of-range selection rather than comparing past the end", () => {
    expect(gradeChoice(OPTIONS, "1", 9, 5)).toEqual({ isCorrect: false, score: 0 });
    expect(gradeChoice(OPTIONS, "1", -1, 5)).toEqual({ isCorrect: false, score: 0 });
  });

  it("fails a missing selection without throwing", () => {
    expect(gradeChoice(OPTIONS, "1", undefined, 5)).toEqual({ isCorrect: false, score: 0 });
  });

  it("fails when the stored answer names no valid index", () => {
    expect(gradeChoice(OPTIONS, null, 1, 5)).toEqual({ isCorrect: false, score: 0 });
    expect(gradeChoice(OPTIONS, "not-a-number", 1, 5)).toEqual({ isCorrect: false, score: 0 });
  });

  it("fails when the options are not an array, so a malformed question cannot pass anyone", () => {
    expect(gradeChoice(null, "0", 0, 5)).toEqual({ isCorrect: false, score: 0 });
    expect(gradeChoice("Mecca", "0", 0, 5)).toEqual({ isCorrect: false, score: 0 });
  });

  it("awards the question's own marks, not a fixed value", () => {
    expect(gradeChoice(OPTIONS, "0", 0, 2.5)).toEqual({ isCorrect: true, score: 2.5 });
  });
});
