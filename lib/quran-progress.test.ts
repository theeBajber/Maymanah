import { describe, expect, it } from "vitest";

import type { AyahRangeInput } from "./quran-meta";
import {
  lastMemorizedAyah,
  memorizationPercent,
  mergeIntervals,
  rangeIntervals,
  uniqueAyahCount,
} from "./quran-progress";

const range = (
  fromSurah: number,
  fromAyah: number,
  toSurah: number,
  toAyah: number,
): AyahRangeInput => ({ fromSurah, fromAyah, toSurah, toAyah });

describe("mergeIntervals", () => {
  it("merges overlapping spans", () => {
    expect(
      mergeIntervals([
        { start: 1, end: 5 },
        { start: 4, end: 10 },
      ]),
    ).toEqual([{ start: 1, end: 10 }]);
  });

  it("merges adjacent spans", () => {
    expect(
      mergeIntervals([
        { start: 6, end: 10 },
        { start: 1, end: 5 },
      ]),
    ).toEqual([{ start: 1, end: 10 }]);
  });

  it("keeps a gap apart", () => {
    expect(
      mergeIntervals([
        { start: 1, end: 5 },
        { start: 8, end: 10 },
      ]),
    ).toEqual([
      { start: 1, end: 5 },
      { start: 8, end: 10 },
    ]);
  });
});

describe("rangeIntervals", () => {
  it("skips a range that cannot be placed in the Quran", () => {
    expect(rangeIntervals([range(1, 8, 2, 1), range(1, 1, 1, 2)])).toEqual([{ start: 1, end: 2 }]);
  });
});

describe("uniqueAyahCount", () => {
  it("counts an overlapping range once", () => {
    const ranges = [range(1, 1, 1, 5), range(1, 4, 2, 2)];
    // 1:1–7 is seven ayahs, 2:1–2 adds two more.
    expect(uniqueAyahCount(ranges)).toBe(9);
  });

  it("counts the whole Quran as 6236", () => {
    expect(uniqueAyahCount([range(1, 1, 114, 6)])).toBe(6236);
  });

  it("does not double count a repeated range", () => {
    expect(uniqueAyahCount([range(2, 255, 2, 286), range(2, 255, 2, 286)])).toBe(32);
  });
});

describe("memorizationPercent", () => {
  it("is zero with nothing memorised", () => {
    expect(memorizationPercent([])).toBe(0);
  });

  it("rounds to one decimal", () => {
    expect(memorizationPercent([range(1, 1, 1, 7)])).toBe(0.1);
  });

  it("reaches one hundred only for the whole Quran", () => {
    expect(memorizationPercent([range(1, 1, 114, 6)])).toBe(100);
  });
});

describe("lastMemorizedAyah", () => {
  it("is null with no ranges", () => {
    expect(lastMemorizedAyah([])).toBeNull();
  });

  it("takes the furthest end, not the latest entry", () => {
    const ranges = [range(5, 1, 5, 10), range(2, 1, 2, 5)];
    expect(lastMemorizedAyah(ranges)).toEqual({ surah: 5, ayah: 10 });
  });

  it("resolves an end that sits at a surah boundary", () => {
    expect(lastMemorizedAyah([range(1, 1, 1, 7)])).toEqual({ surah: 1, ayah: 7 });
    expect(lastMemorizedAyah([range(1, 7, 2, 1)])).toEqual({ surah: 2, ayah: 1 });
  });
});
