import { describe, expect, it } from "vitest";

import {
  JOIN_EARLY_MS,
  JOIN_LATE_MS,
  checkRange,
  joinStateFor,
  joinWindow,
  nextAyahAfter,
  planRangeLabel,
  rangeHint,
  revisionPhraseExists,
  sessionTypeLabel,
  suggestedNextAssignment,
  toggleRevisionPhrase,
} from "@/lib/live-session";
import { SURAHS } from "@/lib/quran-meta";

const START = new Date("2026-11-15T10:00:00.000Z");
const END = new Date("2026-11-15T11:00:00.000Z");

function at(offsetMs: number): Date {
  return new Date(START.getTime() + offsetMs);
}

describe("joinWindow", () => {
  it("opens fifteen minutes early and closes an hour after the end", () => {
    const window = joinWindow(START, END);

    expect(window.opensAt.getTime()).toBe(START.getTime() - JOIN_EARLY_MS);
    expect(window.closesAt.getTime()).toBe(END.getTime() + JOIN_LATE_MS);
  });

  it("treats a missing end time as a one-hour lesson", () => {
    expect(joinWindow(START, null).closesAt.getTime()).toBe(
      START.getTime() + 60 * 60 * 1000 + JOIN_LATE_MS,
    );
  });
});

describe("joinStateFor", () => {
  it("is upcoming before the window opens", () => {
    const state = joinStateFor({
      startTime: START,
      endTime: END,
      status: "SCHEDULED",
      now: at(-JOIN_EARLY_MS - 1),
    });

    expect(state.state).toBe("upcoming");
  });

  it("is open exactly when the window opens", () => {
    expect(
      joinStateFor({
        startTime: START,
        endTime: END,
        status: "SCHEDULED",
        now: at(-JOIN_EARLY_MS),
      }).state,
    ).toBe("open");
  });

  it("stays open through the late window", () => {
    expect(
      joinStateFor({
        startTime: START,
        endTime: END,
        status: "ONGOING",
        now: at(60 * 60 * 1000 + JOIN_LATE_MS),
      }).state,
    ).toBe("open");
  });

  it("ends one millisecond after the late window", () => {
    expect(
      joinStateFor({
        startTime: START,
        endTime: END,
        status: "SCHEDULED",
        now: at(60 * 60 * 1000 + JOIN_LATE_MS + 1),
      }).state,
    ).toBe("ended");
  });

  it("never opens a cancelled session", () => {
    expect(
      joinStateFor({ startTime: START, endTime: END, status: "CANCELLED", now: START }).state,
    ).toBe("cancelled");
  });

  it("treats a completed session as ended even inside the window", () => {
    expect(
      joinStateFor({ startTime: START, endTime: END, status: "COMPLETED", now: START }).state,
    ).toBe("ended");
  });
});

describe("checkRange", () => {
  it("counts a range inside one surah", () => {
    expect(checkRange({ fromSurah: 2, fromAyah: 1, toSurah: 2, toAyah: 5 }, SURAHS)).toEqual({
      valid: true,
      ayahs: 5,
    });
  });

  it("counts across a surah boundary", () => {
    expect(checkRange({ fromSurah: 1, fromAyah: 7, toSurah: 2, toAyah: 1 }, SURAHS)).toEqual({
      valid: true,
      ayahs: 2,
    });
  });

  it("counts a whole surah", () => {
    expect(checkRange({ fromSurah: 2, fromAyah: 286, toSurah: 3, toAyah: 1 }, SURAHS)).toEqual({
      valid: true,
      ayahs: 2,
    });
  });

  it("rejects an ayah beyond the surah", () => {
    expect(checkRange({ fromSurah: 2, fromAyah: 287, toSurah: 2, toAyah: 287 }, SURAHS)).toEqual({
      valid: false,
      reason: "ayah_out_of_range",
    });
  });

  it("rejects a range that runs backwards", () => {
    expect(checkRange({ fromSurah: 2, fromAyah: 5, toSurah: 2, toAyah: 1 }, SURAHS)).toEqual({
      valid: false,
      reason: "empty_range",
    });
  });

  it("rejects an unknown surah", () => {
    expect(checkRange({ fromSurah: 115, fromAyah: 1, toSurah: 115, toAyah: 1 }, SURAHS)).toEqual({
      valid: false,
      reason: "unknown_surah",
    });
  });
});

describe("rangeHint", () => {
  it("explains a valid single-surah range", () => {
    const hint = rangeHint({ fromSurah: 2, fromAyah: 1, toSurah: 2, toAyah: 5 }, SURAHS);

    expect(hint.valid).toBe(true);
    expect(hint.ayahs).toBe(5);
    expect(hint.message).toBe("Valid range · 5 ayahs · Al-Baqara has 286");
  });

  it("names the surah and its length for a bad ayah", () => {
    const hint = rangeHint({ fromSurah: 2, fromAyah: 300, toSurah: 2, toAyah: 300 }, SURAHS);

    expect(hint.valid).toBe(false);
    expect(hint.message).toBe("Al-Baqara has 286 ayahs, so ayah 300 does not exist.");
  });

  it("explains a backwards range", () => {
    const hint = rangeHint({ fromSurah: 3, fromAyah: 1, toSurah: 2, toAyah: 286 }, SURAHS);

    expect(hint.valid).toBe(false);
    expect(hint.message).toContain("must not come before");
  });

  it("shows both ends for a cross-surah range", () => {
    const hint = rangeHint({ fromSurah: 1, fromAyah: 7, toSurah: 2, toAyah: 1 }, SURAHS);

    expect(hint.valid).toBe(true);
    expect(hint.message).toContain("2 ayahs");
    expect(hint.message).toContain("Al-Faatiha 1:7");
    expect(hint.message).toContain("Al-Baqara 2:1");
  });
});

describe("nextAyahAfter", () => {
  it("moves within a surah", () => {
    expect(nextAyahAfter({ surah: 2, ayah: 1 }, SURAHS)).toEqual({ surah: 2, ayah: 2 });
  });

  it("moves to the next surah at the end of one", () => {
    expect(nextAyahAfter({ surah: 1, ayah: 7 }, SURAHS)).toEqual({ surah: 2, ayah: 1 });
  });

  it("stops after the final ayah", () => {
    expect(nextAyahAfter({ surah: 114, ayah: 6 }, SURAHS)).toBeNull();
  });

  it("returns null for an unknown surah", () => {
    expect(nextAyahAfter({ surah: 115, ayah: 1 }, SURAHS)).toBeNull();
  });
});

describe("planRangeLabel", () => {
  it("formats a single ayah", () => {
    expect(
      planRangeLabel({ fromSurah: 2, fromVerse: 255, toSurah: 2, toVerse: 255 }, SURAHS),
    ).toBe("Al-Baqara 2:255");
  });

  it("formats a range inside one surah", () => {
    expect(planRangeLabel({ fromSurah: 2, fromVerse: 1, toSurah: 2, toVerse: 5 }, SURAHS)).toBe(
      "Al-Baqara 2:1–5",
    );
  });

  it("names both surahs for a cross-surah range", () => {
    expect(planRangeLabel({ fromSurah: 1, fromVerse: 7, toSurah: 2, toVerse: 1 }, SURAHS)).toBe(
      "Al-Faatiha 1:7 – Al-Baqara 2:1",
    );
  });
});

describe("suggestedNextAssignment", () => {
  it("prefers the next scheduled plan", () => {
    expect(
      suggestedNextAssignment({
        nextPlan: { fromSurah: 2, fromVerse: 6, toSurah: 2, toVerse: 10 },
        lastStop: { surah: 2, ayah: 5 },
        surahs: SURAHS,
      }),
    ).toBe("Prepare Al-Baqara 2:6–10 for the next lesson.");
  });

  it("falls back to the ayah after the last stop", () => {
    expect(
      suggestedNextAssignment({ nextPlan: null, lastStop: { surah: 1, ayah: 7 }, surahs: SURAHS }),
    ).toBe("Continue from Al-Baqara 2:1.");
  });

  it("says so at the end of the Quran", () => {
    expect(
      suggestedNextAssignment({ nextPlan: null, lastStop: { surah: 114, ayah: 6 }, surahs: SURAHS }),
    ).toContain("end of the Quran");
  });

  it("is empty without a plan or a stop", () => {
    expect(suggestedNextAssignment({ nextPlan: null, lastStop: null, surahs: SURAHS })).toBe("");
  });
});

describe("revision chips", () => {
  const phrase = "Sabaq: Al-Baqara 2:1–5";

  it("adds a phrase to an empty note", () => {
    expect(toggleRevisionPhrase("", phrase)).toBe(phrase);
  });

  it("appends without losing typed text", () => {
    expect(toggleRevisionPhrase("Tajweed of madd", phrase)).toBe(`Tajweed of madd, ${phrase}`);
  });

  it("removes a phrase and its separator", () => {
    expect(toggleRevisionPhrase(`${phrase}, Tajweed of madd`, phrase)).toBe("Tajweed of madd");
    expect(toggleRevisionPhrase(`Tajweed of madd, ${phrase}`, phrase)).toBe("Tajweed of madd");
  });

  it("removes the last remaining phrase cleanly", () => {
    expect(toggleRevisionPhrase(phrase, phrase)).toBe("");
  });

  it("keeps typed text that wrapped the phrase", () => {
    expect(toggleRevisionPhrase(`${phrase} with tajweed`, phrase)).toBe("with tajweed");
  });

  it("reports whether a phrase is present", () => {
    expect(revisionPhraseExists(`${phrase}, extra`, phrase)).toBe(true);
    expect(revisionPhraseExists("extra", phrase)).toBe(false);
    expect(revisionPhraseExists("", "")).toBe(false);
  });
});

describe("sessionTypeLabel", () => {
  it("maps the stored types", () => {
    expect(sessionTypeLabel("DAILY_HIFDH")).toBe("Memorisation");
    expect(sessionTypeLabel("MURAJA")).toBe("Review");
    expect(sessionTypeLabel("EXTRA")).toBe("Extra session");
    expect(sessionTypeLabel("SOMETHING_ELSE")).toBe("Session");
  });
});
