import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { QfPage, QfPagination, QfVerse } from "./types";

const { quranFetchMock } = vi.hoisted(() => ({
  quranFetchMock: vi.fn(),
}));

vi.mock("./client", () => ({
  quranFetch: quranFetchMock,
}));

vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => unknown) => callback,
}));

import {
  getQuranCatalog,
  getQuranChapterAudio,
  getQuranPageData,
  getQuranRecitations,
} from "./cache";

function verse(
  verseKey: string,
  pageNumber: number,
  words: QfVerse["words"] = [],
): QfVerse {
  const [chapter, verseNumber] = verseKey.split(":").map(Number);

  return {
    id: chapter * 1_000 + verseNumber,
    chapter_id: chapter,
    verse_number: verseNumber,
    verse_key: verseKey,
    page_number: pageNumber,
    juz_number: 1,
    hizb_number: 1,
    rub_el_hizb_number: 1,
    words,
  };
}

function page(pageNumber: number, verseMapping: Record<string, string>): QfPage {
  return {
    id: pageNumber,
    page_number: pageNumber,
    verse_mapping: verseMapping,
    verses_count: 2,
  };
}

function pagination(nextPage: number | null): QfPagination {
  return {
    per_page: 50,
    current_page: 1,
    next_page: nextPage,
    total_pages: nextPage ? 2 : 1,
    total_records: 2,
  };
}

describe("Quran cache data", () => {
  beforeEach(() => {
    vi.stubEnv("QF_ENV", "prelive");
    vi.stubEnv("QF_CLIENT_ID", "test-client-id");
    vi.stubEnv("QF_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("QF_AUTH_BASE_URL", "");
    vi.stubEnv("QF_CONTENT_BASE_URL", "");
    vi.stubEnv("QF_MEDIA_BASE_URL", "");
    vi.stubEnv("QF_REQUEST_TIMEOUT_MS", "");
    quranFetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads the recitation catalogue", async () => {
    quranFetchMock.mockResolvedValue({
      recitations: [{ id: 7, reciter_name: "Mishari Rashid al-`Afasy" }],
    });

    await expect(getQuranRecitations()).resolves.toEqual([
      { id: 7, reciter_name: "Mishari Rashid al-`Afasy" },
    ]);
    expect(quranFetchMock).toHaveBeenCalledWith("/resources/recitations", {
      language: "en",
    });
  });

  it("paginates chapter audio and resolves each verse URL", async () => {
    quranFetchMock.mockImplementation(
      async (path: string, params: Record<string, unknown>) => {
        if (path !== "/recitations/7/by_chapter/2") {
          throw new Error(`Unexpected path ${path}`);
        }

        if (params.page === 1) {
          return {
            audio_files: [
              {
                verse_key: "2:2",
                url: "Alafasy/mp3/002002.mp3",
                page_number: 2,
                segments: [
                  [1, 2, 900, 1_800],
                  [0, 1, 0, 890],
                ],
              },
            ],
            pagination: pagination(2),
          };
        }

        return {
          audio_files: [
            {
              verse_key: "2:1",
              url: "//mirrors.quranicaudio.com/everyayah/002001.mp3",
              page_number: 2,
              segments: [[0, 1, 0, 100]],
            },
          ],
          pagination: pagination(null),
        };
      },
    );

    const result = await getQuranChapterAudio(7, 2);

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          verseKey: "2:2",
          url: "https://verses.quran.foundation/Alafasy/mp3/002002.mp3",
          pageNumber: 2,
          segments: [
            [0, 1, 0, 890],
            [1, 2, 900, 1_800],
          ],
        },
        {
          verseKey: "2:1",
          url: "https://mirrors.quranicaudio.com/everyayah/002001.mp3",
          pageNumber: 2,
          segments: [[0, 1, 0, 100]],
        },
      ]),
    );
    expect(quranFetchMock).toHaveBeenCalledWith(
      "/recitations/7/by_chapter/2",
      expect.objectContaining({
        fields: "segments,page_number",
        per_page: 50,
        page: 1,
      }),
    );
    expect(quranFetchMock).toHaveBeenCalledWith(
      "/recitations/7/by_chapter/2",
      expect.objectContaining({ page: 2 }),
    );
  });

  it("loads catalog chapters and juzs", async () => {
    quranFetchMock.mockImplementation(async (path: string) => {
      if (path === "/chapters") {
        return { chapters: [{ id: 1 }] };
      }
      if (path === "/juzs") {
        return { juzs: [{ juz_number: 1 }] };
      }
      throw new Error(`Unexpected path ${path}`);
    });

    await expect(getQuranCatalog()).resolves.toEqual({
      chapters: [{ id: 1 }],
      juzs: [{ juz_number: 1 }],
    });
  });

  it("paginates chapter verses and keeps only the requested page", async () => {
    quranFetchMock.mockImplementation(
      async (path: string, params: Record<string, unknown>) => {
        if (path === "/pages/2") {
          return { page: page(2, { "2": "2:1-2:5" }) };
        }

        if (path === "/verses/by_chapter/2") {
          if (params.page === 1) {
            return {
              verses: [verse("2:1", 2), verse("2:2", 2)],
              pagination: pagination(2),
            };
          }

          return {
            verses: [verse("2:3", 2), verse("2:4", 3)],
            pagination: pagination(null),
          };
        }

        throw new Error(`Unexpected path ${path}`);
      },
    );

    const result = await getQuranPageData({
      pageNumber: 2,
      mushafId: 1,
      translationId: 85,
    });

    expect(result.page.pageNumber).toBe(2);
    expect(result.verses.map((item) => item.key)).toEqual([
      "2:1",
      "2:2",
      "2:3",
    ]);
    expect(quranFetchMock).toHaveBeenCalledWith(
      "/verses/by_chapter/2",
      expect.objectContaining({
        mushaf: 1,
        translations: 85,
        per_page: 50,
        page: 1,
      }),
    );
    expect(quranFetchMock).toHaveBeenCalledWith(
      "/verses/by_chapter/2",
      expect.objectContaining({ page: 2 }),
    );
  });
});
