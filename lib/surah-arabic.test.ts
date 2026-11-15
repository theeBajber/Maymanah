import { describe, expect, it } from "vitest";

import { SURAH_ARABIC_NAMES, surahArabicName } from "@/lib/surah-arabic";

describe("SURAH_ARABIC_NAMES", () => {
  it("has an entry for every surah and nothing outside 1–114", () => {
    const numbers = Object.keys(SURAH_ARABIC_NAMES).map(Number);

    expect(numbers).toHaveLength(114);
    for (let number = 1; number <= 114; number += 1) {
      expect(numbers).toContain(number);
    }
  });

  it("never leaves a name empty or padded", () => {
    for (let number = 1; number <= 114; number += 1) {
      const name = SURAH_ARABIC_NAMES[number];

      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
      expect(name).toBe(name.trim());
    }
  });

  it("matches the Tanzil metadata at the well-known ends", () => {
    expect(SURAH_ARABIC_NAMES[1]).toBe("الفاتحة");
    expect(SURAH_ARABIC_NAMES[2]).toBe("البقرة");
    expect(SURAH_ARABIC_NAMES[36]).toBe("يس");
    expect(SURAH_ARABIC_NAMES[114]).toBe("الناس");
  });

  it("returns null outside the table", () => {
    expect(surahArabicName(0)).toBeNull();
    expect(surahArabicName(115)).toBeNull();
    expect(surahArabicName(2)).toBe("البقرة");
  });
});
