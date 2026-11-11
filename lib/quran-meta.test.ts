import { describe, expect, it } from "vitest";

import {
  absoluteAyah,
  positionToAyah,
  rangeLabel,
  SURAHS,
  TOTAL_QURAN_AYAHS,
  validateAyahRange,
} from "./quran-meta";

describe("surah metadata", () => {
  it("holds every surah and every ayah", () => {
    expect(SURAHS).toHaveLength(114);
    expect(SURAHS.reduce((total, surah) => total + surah.ayahCount, 0)).toBe(TOTAL_QURAN_AYAHS);
    expect(TOTAL_QURAN_AYAHS).toBe(6236);
  });

  it("numbers surahs without gaps", () => {
    expect(SURAHS.every((surah, index) => surah.number === index + 1)).toBe(true);
  });

  it("matches known ayah counts at both ends", () => {
    expect(SURAHS[0]).toMatchObject({ number: 1, ayahCount: 7 });
    expect(SURAHS[1]).toMatchObject({ number: 2, ayahCount: 286 });
    expect(SURAHS[113]).toMatchObject({ number: 114, ayahCount: 6 });
  });
});

describe("absoluteAyah", () => {
  it("counts from the first ayah of the Quran", () => {
    expect(absoluteAyah(1, 1)).toBe(1);
    expect(absoluteAyah(1, 7)).toBe(7);
    expect(absoluteAyah(2, 1)).toBe(8);
    expect(absoluteAyah(2, 255)).toBe(262);
    expect(absoluteAyah(114, 6)).toBe(6236);
  });

  it("rejects an unknown surah or an ayah outside it", () => {
    expect(absoluteAyah(115, 1)).toBeNull();
    expect(absoluteAyah(1, 8)).toBeNull();
    expect(absoluteAyah(2, 287)).toBeNull();
    expect(absoluteAyah(1, 0)).toBeNull();
  });
});

describe("positionToAyah", () => {
  it("round-trips a surah:ayah pair", () => {
    expect(positionToAyah(1)).toEqual({ surah: 1, ayah: 1 });
    expect(positionToAyah(262)).toEqual({ surah: 2, ayah: 255 });
    expect(positionToAyah(6236)).toEqual({ surah: 114, ayah: 6 });
  });

  it("rejects a position outside the Quran", () => {
    expect(positionToAyah(0)).toBeNull();
    expect(positionToAyah(6237)).toBeNull();
    expect(positionToAyah(1.5)).toBeNull();
  });
});

describe("validateAyahRange", () => {
  const base = { fromSurah: 1, fromAyah: 1, toSurah: 1, toAyah: 7 };

  it("accepts a normal range and a single ayah", () => {
    expect(validateAyahRange(base)).toEqual({ ok: true });
    expect(validateAyahRange({ ...base, toAyah: 1 })).toEqual({ ok: true });
  });

  it("accepts a range that crosses surahs", () => {
    expect(
      validateAyahRange({ fromSurah: 2, fromAyah: 285, toSurah: 3, toAyah: 2 }),
    ).toEqual({ ok: true });
  });

  it("rejects an unknown surah", () => {
    expect(validateAyahRange({ ...base, fromSurah: 115 })).toEqual({
      ok: false,
      reason: "unknown_surah",
    });
  });

  it("rejects an ayah outside its surah", () => {
    expect(validateAyahRange({ ...base, toAyah: 8 })).toEqual({
      ok: false,
      reason: "ayah_out_of_range",
    });
    expect(validateAyahRange({ ...base, fromAyah: 0 })).toEqual({
      ok: false,
      reason: "ayah_out_of_range",
    });
  });

  it("rejects a range that runs backwards", () => {
    expect(
      validateAyahRange({ fromSurah: 3, fromAyah: 1, toSurah: 2, toAyah: 286 }),
    ).toEqual({ ok: false, reason: "empty_range" });
    expect(
      validateAyahRange({ fromSurah: 2, fromAyah: 10, toSurah: 2, toAyah: 5 }),
    ).toEqual({ ok: false, reason: "empty_range" });
  });
});

describe("rangeLabel", () => {
  it("names one surah once", () => {
    expect(
      rangeLabel({ fromSurah: 2, fromAyah: 1, toSurah: 2, toAyah: 5 }),
    ).toBe("Al-Baqara 2:1–5");
  });

  it("names both surahs when the range crosses them", () => {
    expect(
      rangeLabel({ fromSurah: 2, fromAyah: 285, toSurah: 3, toAyah: 2 }),
    ).toBe("Al-Baqara 2:285 – Aal-i-Imraan 3:2");
  });
});
