import { describe, expect, it } from "vitest";

import {
  completionModeFor,
  evaluateCompletion,
  HIFDH_SLUG,
  memorizationComplete,
  memorizationPercentFromAyahs,
} from "./course-completion";
import { TOTAL_QURAN_AYAHS } from "./quran-meta";

describe("completionModeFor", () => {
  it("treats Hifdh as a memorisation track", () => {
    expect(completionModeFor(HIFDH_SLUG)).toBe("memorization");
  });

  it("keeps every other course on lessons", () => {
    expect(completionModeFor("tajweed-foundations")).toBe("lessons");
    expect(completionModeFor("")).toBe("lessons");
  });
});

describe("memorizationPercentFromAyahs", () => {
  it("is zero before anything is memorised", () => {
    expect(memorizationPercentFromAyahs(0)).toBe(0);
    expect(memorizationPercentFromAyahs(-10)).toBe(0);
  });

  it("rounds to one decimal", () => {
    expect(memorizationPercentFromAyahs(TOTAL_QURAN_AYAHS / 2)).toBe(50);
    expect(memorizationPercentFromAyahs(1)).toBe(0);
  });

  it("never reports more than the whole Quran", () => {
    expect(memorizationPercentFromAyahs(TOTAL_QURAN_AYAHS + 100)).toBe(100);
  });
});

describe("memorizationComplete", () => {
  it("needs the last ayah, not a rounded-up percentage", () => {
    expect(memorizationComplete(TOTAL_QURAN_AYAHS - 1)).toBe(false);
    expect(memorizationComplete(TOTAL_QURAN_AYAHS)).toBe(true);
  });
});

describe("evaluateCompletion", () => {
  it("finishes a lesson course only when every published lesson is done", () => {
    expect(
      evaluateCompletion({ mode: "lessons", completedLessons: 3, lessonCount: 3 }),
    ).toEqual({ completed: true, progress: 100 });
    expect(
      evaluateCompletion({ mode: "lessons", completedLessons: 2, lessonCount: 3 }),
    ).toEqual({ completed: false, progress: 67 });
  });

  it("does not finish an empty lesson course", () => {
    expect(evaluateCompletion({ mode: "lessons", completedLessons: 0, lessonCount: 0 })).toEqual({
      completed: false,
      progress: 0,
    });
  });

  it("finishes a memorisation course at the whole Quran", () => {
    expect(
      evaluateCompletion({
        mode: "memorization",
        completedLessons: 0,
        lessonCount: 18,
        memorizedAyahs: TOTAL_QURAN_AYAHS,
      }),
    ).toEqual({ completed: true, progress: 100 });
    expect(
      evaluateCompletion({
        mode: "memorization",
        completedLessons: 18,
        lessonCount: 18,
        memorizedAyahs: 0,
      }),
    ).toEqual({ completed: false, progress: 0 });
  });
});
