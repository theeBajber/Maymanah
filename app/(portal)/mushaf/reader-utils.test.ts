import { describe, expect, it } from "vitest";

import {
  parseTranslationParts,
  readerProgress,
  showsBismillah,
  stripHtml,
  toArabicNumber,
  verseBookmarkKey,
} from "./reader-utils";
import type { QfChapter, ReaderVerse } from "@/lib/qf/types";

function chapter(overrides: Partial<QfChapter> = {}): QfChapter {
  return {
    id: 56,
    revelation_place: "makkah",
    revelation_order: 46,
    bismillah_pre: true,
    name_simple: "Al-Waqi'ah",
    name_complex: "Al-Waqi'ah",
    name_arabic: "الواقعة",
    verses_count: 96,
    pages: [534, 535, 536],
    translated_name: { language_name: "english", name: "The Inevitable" },
    ...overrides,
  };
}

function verse(overrides: Partial<ReaderVerse> = {}): ReaderVerse {
  return {
    id: 1,
    key: "56:1",
    chapterId: 56,
    verseNumber: 1,
    pageNumber: 534,
    juzNumber: 27,
    hizbNumber: 54,
    rubElHizbNumber: 107,
    words: [],
    translations: [],
    ...overrides,
  };
}

describe("stripHtml", () => {
  it("removes markup, decodes entities, and normalizes whitespace", () => {
    expect(stripHtml("<p>Allah&nbsp;is <b>one</b> &amp; only.</p>")).toBe(
      "Allah is one & only.",
    );
  });
});

describe("parseTranslationParts", () => {
  it("splits footnote markers from the translation", () => {
    const parts = parseTranslationParts(
      'The Most Gracious <sup foot_note="1">1</sup> taught the Quran.',
      { "1": "A name of Allah." },
    );

    expect(parts).toEqual([
      { type: "text", text: "The Most Gracious" },
      {
        type: "footnote",
        number: "1",
        label: "1",
        note: "A name of Allah.",
      },
      { type: "text", text: "taught the Quran." },
    ]);
  });

  it("keeps the text when no footnote exists", () => {
    expect(parseTranslationParts("<p>Plain translation</p>")).toEqual([
      { type: "text", text: "Plain translation" },
    ]);
  });
});

describe("toArabicNumber", () => {
  it("renders Arabic-Indic digits", () => {
    expect(toArabicNumber(534)).toBe("٥٣٤");
  });
});

describe("verseBookmarkKey", () => {
  it("splits the verse key into a bookmark reference", () => {
    expect(verseBookmarkKey(verse())).toEqual({
      key: "56:1",
      surah: 56,
      ayah: 1,
    });
  });
});

describe("readerProgress", () => {
  it("measures the last verse on the page against the chapter", () => {
    expect(
      readerProgress(
        [verse(), verse({ key: "56:12", verseNumber: 12 })],
        chapter(),
      ),
    ).toBe(13);
  });

  it("returns zero without a chapter", () => {
    expect(readerProgress([verse()], undefined)).toBe(0);
  });
});

describe("showsBismillah", () => {
  it("shows it when a chapter opens away from Al-Fatihah and At-Tawbah", () => {
    expect(showsBismillah([verse()])).toBe(true);
  });

  it("skips Al-Fatihah and At-Tawbah", () => {
    expect(showsBismillah([verse({ chapterId: 1, key: "1:1" })])).toBe(false);
    expect(showsBismillah([verse({ chapterId: 9, key: "9:1" })])).toBe(false);
  });

  it("skips pages that do not open a chapter", () => {
    expect(showsBismillah([verse({ verseNumber: 2, key: "56:2" })])).toBe(
      false,
    );
  });
});
