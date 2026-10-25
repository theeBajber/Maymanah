import { describe, expect, it } from "vitest";

import { normalizePage } from "./normalize";
import type { QfPage, QfVerse } from "./types";

function verse(
  overrides: Partial<QfVerse> & Pick<QfVerse, "id" | "verse_key" | "verse_number">,
): QfVerse {
  return {
    page_number: 1,
    juz_number: 1,
    hizb_number: 1,
    rub_el_hizb_number: 1,
    ...overrides,
  };
}

const page: QfPage = {
  id: 1,
  page_number: 1,
  verse_mapping: { "1": "1-2" },
  first_verse_id: 1,
  last_verse_id: 2,
  verses_count: 2,
};

describe("normalizePage", () => {
  it("groups words into page lines and preserves cross-verse lines", () => {
    const result = normalizePage({
      page,
      mushafId: 1,
      verses: [
        verse({
          id: 1,
          verse_key: "1:1",
          verse_number: 1,
          chapter_id: 1,
          words: [
            {
              id: 1,
              position: 1,
              line_number: 2,
              text_qpc_hafs: "بِسۡمِ",
              translation: { text: "In the name" },
            },
            {
              id: 2,
              position: 2,
              line_number: 2,
              text_uthmani: "ٱللَّهِ",
            },
          ],
        }),
        verse({
          id: 2,
          verse_key: "1:2",
          verse_number: 2,
          chapter_id: 1,
          words: [
            {
              id: 3,
              position: 1,
              line_number: 2,
              text_qpc_hafs: "ٱلۡحَمۡدُ",
            },
          ],
        }),
      ],
    });

    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].lineNumber).toBe(2);
    expect(result.lines[0].verseKeys).toEqual(["1:1", "1:2"]);
    expect(result.lines[0].words.map((word) => word.text)).toEqual([
      "بِسۡمِ",
      "ٱللَّهِ",
      "ٱلۡحَمۡدُ",
    ]);
  });

  it("normalizes word identity, page data and translations", () => {
    const result = normalizePage({
      page,
      mushafId: 1,
      verses: [
        verse({
          id: 1,
          verse_key: "1:1",
          verse_number: 1,
          page_number: 1,
          chapter_id: 1,
          words: [
            {
              id: 7,
              position: 3,
              line_number: 4,
              v2_page: 1,
              text_qpc_hafs: "qpc",
              text_uthmani: "uthmani",
              code_v2: "code",
              translation: { text: "word translation" },
              transliteration: { text: "word transliteration" },
            },
          ],
          translations: [
            {
              resource_id: 85,
              resource_name: "Abdel Haleem",
              text: "verse translation",
              language_name: "english",
              verse_key: "1:1",
            },
          ],
        }),
      ],
    });

    const word = result.verses[0].words[0];
    expect(word).toMatchObject({
      key: "1:1:3",
      id: 7,
      verseKey: "1:1",
      pageNumber: 1,
      lineNumber: 4,
      text: "qpc",
      textUthmani: "uthmani",
      codeV2: "code",
      translation: "word translation",
      transliteration: "word transliteration",
    });
    expect(result.verses[0].translations[0]).toEqual({
      resourceId: 85,
      resourceName: "Abdel Haleem",
      text: "verse translation",
      languageName: "english",
      verseKey: "1:1",
      footNotes: undefined,
    });
  });

  it("falls back to verse data and the verse key when word fields are absent", () => {
    const result = normalizePage({
      page,
      mushafId: 1,
      verses: [
        verse({
          id: 1,
          verse_key: "2:255",
          verse_number: 255,
          page_number: 42,
          words: [
            {
              position: 1,
              text_indopak_nastaleeq: "indopak",
            },
          ],
        }),
      ],
    });

    expect(result.verses[0].chapterId).toBe(2);
    const word = result.verses[0].words[0];
    expect(word).toMatchObject({
      key: "2:255:1",
      verseKey: "2:255",
      pageNumber: 42,
      lineNumber: 0,
      text: "indopak",
    });
  });

  it("summarizes page metadata and tolerates missing mappings", () => {
    const result = normalizePage({
      page: {
        id: 2,
        page_number: 2,
        verse_mapping: {},
      },
      mushafId: 2,
      verses: [
        verse({
          id: 10,
          verse_key: "1:7",
          verse_number: 7,
          chapter_id: 1,
          juz_number: 1,
          hizb_number: 1,
        }),
        verse({
          id: 11,
          verse_key: "2:1",
          verse_number: 1,
          chapter_id: 2,
          juz_number: 1,
          hizb_number: 1,
        }),
      ],
    });

    expect(result.page).toMatchObject({
      pageNumber: 2,
      mushafId: 2,
      versesCount: 2,
      firstVerseKey: "1:7",
      lastVerseKey: "2:1",
      chapterIds: [1, 2],
      juzNumbers: [1],
      hizbNumbers: [1],
    });
  });
});
