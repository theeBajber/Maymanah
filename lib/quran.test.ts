import { describe, expect, it } from "vitest";

import {
  getJuzNumber,
  getJuzStartPage,
  hasCompletedNewJuz,
  TOTAL_SURAHS,
} from "./quran";

describe("getJuzNumber", () => {
  it("places the opening chapter in the first part", () => {
    expect(getJuzNumber(1, 1)).toBe(1);
    expect(getJuzNumber(1, 7)).toBe(1);
  });

  it("places the last verse of a part inside it", () => {
    expect(getJuzNumber(2, 141)).toBe(1);
  });

  it("places the first verse past a boundary in the next part", () => {
    expect(getJuzNumber(2, 142)).toBe(2);
  });

  it("places the end of the text in the thirtieth part", () => {
    expect(getJuzNumber(114, 6)).toBe(30);
  });

  it("never returns outside one to thirty", () => {
    for (const [surah, verse] of [[1, 1], [5, 100], [36, 50], [78, 1], [114, 6]] as const) {
      const juz = getJuzNumber(surah, verse);
      expect(juz).toBeGreaterThanOrEqual(1);
      expect(juz).toBeLessThanOrEqual(30);
    }
  });
});

describe("getJuzStartPage", () => {
  it("returns the first page of the opening part", () => {
    expect(getJuzStartPage(1)).toBe(1);
  });

  it("returns the known opening page of later parts", () => {
    expect(getJuzStartPage(2)).toBe(22);
    expect(getJuzStartPage(27)).toBe(522);
    expect(getJuzStartPage(30)).toBe(582);
  });

  it("clamps values outside the thirty parts", () => {
    expect(getJuzStartPage(0)).toBe(1);
    expect(getJuzStartPage(99)).toBe(582);
  });
});

describe("hasCompletedNewJuz", () => {
  it("is true crossing a boundary", () => {
    expect(hasCompletedNewJuz(2, 141, 2, 142)).toBe(true);
  });

  it("is false moving within a part", () => {
    expect(hasCompletedNewJuz(2, 100, 2, 141)).toBe(false);
  });

  it("is false staying still", () => {
    expect(hasCompletedNewJuz(36, 50, 36, 50)).toBe(false);
  });
});

describe("TOTAL_SURAHS", () => {
  it("is the known chapter count", () => {
    expect(TOTAL_SURAHS).toBe(114);
  });
});
