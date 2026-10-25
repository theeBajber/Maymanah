import "server-only";

import { unstable_cache } from "next/cache";

import { normalizeAudioFile } from "./audio";
import { QuranApiError, quranFetch } from "./client";
import { getQuranConfig, type QuranScript } from "./config";
import { normalizePage } from "./normalize";
import type {
  QfAudioFile,
  QfAudioFilesResponse,
  QfChaptersResponse,
  QfJuzsResponse,
  QfPageResponse,
  QfRecitation,
  QfRecitationsResponse,
  QfVerse,
  QfVersesResponse,
  QuranCatalog,
  ReaderAudioFile,
  ReaderPage,
} from "./types";

const DAY_IN_SECONDS = 86_400;
const CACHE_VERSION = "2";

interface GetReaderPageInput {
  pageNumber: number;
  mushafId: number;
  translationId: number;
  script?: QuranScript;
}

export async function getQuranRecitations(): Promise<QfRecitation[]> {
  const config = getQuranConfig();

  return unstable_cache(
    async () => {
      const response = await quranFetch<QfRecitationsResponse>(
        "/resources/recitations",
        { language: "en" },
      );

      return response.recitations;
    },
    [
      "qf-recitations",
      CACHE_VERSION,
      config.env,
      config.contentBaseUrl,
    ],
    {
      revalidate: DAY_IN_SECONDS,
      tags: [`qf-recitations:${CACHE_VERSION}:${config.env}`],
    },
  )();
}

export async function getQuranCatalog(): Promise<QuranCatalog> {
  const config = getQuranConfig();

  return unstable_cache(
    async () => {
      const [chapters, juzs] = await Promise.all([
        quranFetch<QfChaptersResponse>("/chapters", { language: "en" }),
        quranFetch<QfJuzsResponse>("/juzs", { mushaf: 1 }),
      ]);

      return {
        chapters: chapters.chapters,
        juzs: juzs.juzs,
      };
    },
    ["qf-catalog", CACHE_VERSION, config.env, config.contentBaseUrl],
    {
      revalidate: DAY_IN_SECONDS,
      tags: [`qf-catalog:${CACHE_VERSION}:${config.env}`],
    },
  )();
}

async function fetchChapterVerses(
  chapterId: number,
  mushafId: number,
  translationId: number,
): Promise<QfVerse[]> {
  const verses: QfVerse[] = [];
  const seenPages = new Set<number>();
  let page: number | null = 1;

  while (page !== null && !seenPages.has(page)) {
    seenPages.add(page);
    const requestPage: number = page;
    const response: QfVersesResponse = await quranFetch<QfVersesResponse>(
      `/verses/by_chapter/${chapterId}`,
      {
        mushaf: mushafId,
        language: "en",
        words: true,
        translations: translationId,
        word_fields:
          "code_v2,text_uthmani,text_qpc_hafs,text_indopak_nastaleeq,v2_page,translation,transliteration",
        translation_fields:
          "resource_id,resource_name,text,language_name,foot_notes",
        per_page: 50,
        page: requestPage,
      },
    );

    verses.push(...response.verses);
    page = response.pagination?.next_page ?? null;
  }

  return verses;
}

async function getQuranChapterVerses(
  chapterId: number,
  mushafId: number,
  translationId: number,
): Promise<QfVerse[]> {
  const config = getQuranConfig();

  return unstable_cache(
    () => fetchChapterVerses(chapterId, mushafId, translationId),
    [
      "qf-chapter-verses",
      CACHE_VERSION,
      config.env,
      config.contentBaseUrl,
      String(mushafId),
      String(chapterId),
      String(translationId),
    ],
    {
      revalidate: DAY_IN_SECONDS,
      tags: [
        `qf-chapter-verses:${CACHE_VERSION}:${config.env}:${mushafId}:${translationId}:${chapterId}`,
      ],
    },
  )();
}

async function fetchChapterAudio(
  recitationId: number,
  chapterId: number,
  mediaBaseUrl: string,
): Promise<ReaderAudioFile[]> {
  const files = new Map<string, QfAudioFile>();
  const seenPages = new Set<number>();
  let page: number | null = 1;

  while (page !== null && !seenPages.has(page)) {
    seenPages.add(page);
    const requestPage: number = page;
    const response = await quranFetch<QfAudioFilesResponse>(
      `/recitations/${recitationId}/by_chapter/${chapterId}`,
      {
        fields: "segments,page_number",
        per_page: 50,
        page: requestPage,
      },
    );

    for (const file of response.audio_files) {
      files.set(file.verse_key, file);
    }
    page = response.pagination?.next_page ?? null;
  }

  return Array.from(files.values()).map((file) =>
    normalizeAudioFile(file, mediaBaseUrl),
  );
}

export async function getQuranChapterAudio(
  recitationId: number,
  chapterId: number,
): Promise<ReaderAudioFile[]> {
  const config = getQuranConfig();

  return unstable_cache(
    async () => {
      try {
        return await fetchChapterAudio(
          recitationId,
          chapterId,
          config.mediaBaseUrl,
        );
      } catch (error) {
        if (
          recitationId !== 8 ||
          !(error instanceof QuranApiError) ||
          error.code !== "QF_NOT_FOUND"
        ) {
          throw error;
        }

        return fetchChapterAudio(7, chapterId, config.mediaBaseUrl);
      }
    },
    [
      "qf-chapter-audio",
      CACHE_VERSION,
      config.env,
      config.contentBaseUrl,
      config.mediaBaseUrl,
      String(recitationId),
      String(chapterId),
    ],
    {
      revalidate: DAY_IN_SECONDS,
      tags: [
        `qf-chapter-audio:${CACHE_VERSION}:${config.env}:${recitationId}:${chapterId}`,
      ],
    },
  )();
}

export async function getQuranChapterPages(
  chapterId: number,
  mushafId: number,
  translationId: number,
): Promise<ReaderPage[]> {
  const config = getQuranConfig();

  return unstable_cache(
    async () => {
      const verses = await getQuranChapterVerses(
        chapterId,
        mushafId,
        translationId,
      );
      const byPage = new Map<number, QfVerse[]>();

      for (const verse of verses) {
        const pageVerses = byPage.get(verse.page_number) ?? [];
        pageVerses.push(verse);
        byPage.set(verse.page_number, pageVerses);
      }

      return Array.from(byPage.entries())
        .sort(([left], [right]) => left - right)
        .map(([pageNumber, pageVerses]) =>
          normalizePage({
            page: {
              id: pageNumber,
              page_number: pageNumber,
              verse_mapping: {},
            },
            verses: pageVerses,
            mushafId,
          }),
        );
    },
    [
      "qf-chapter-pages",
      CACHE_VERSION,
      config.env,
      config.contentBaseUrl,
      String(mushafId),
      String(chapterId),
      String(translationId),
    ],
    {
      revalidate: DAY_IN_SECONDS,
      tags: [
        `qf-chapter-pages:${CACHE_VERSION}:${config.env}:${mushafId}:${translationId}:${chapterId}`,
      ],
    },
  )();
}

export async function getQuranPageData({
  pageNumber,
  mushafId,
  translationId,
  script = "uthmani",
}: GetReaderPageInput): Promise<ReaderPage> {
  const config = getQuranConfig();

  return unstable_cache(
    async () => {
      const pageResponse = await quranFetch<QfPageResponse>(
        `/pages/${pageNumber}`,
        { mushaf: mushafId },
      );
      const chapterIds = Object.keys(pageResponse.page.verse_mapping ?? {})
        .map(Number)
        .filter(Number.isInteger);
      const chapterVerses = await Promise.all(
        chapterIds.map((chapterId) =>
          getQuranChapterVerses(chapterId, mushafId, translationId),
        ),
      );
      const verses = chapterVerses
        .flat()
        .filter((verse) => verse.page_number === pageNumber);

      return normalizePage({
        page: pageResponse.page,
        verses,
        mushafId,
      });
    },
    [
      "qf-page",
      CACHE_VERSION,
      config.env,
      config.contentBaseUrl,
      String(mushafId),
      String(pageNumber),
      String(translationId),
      script,
    ],
    {
      revalidate: DAY_IN_SECONDS,
      tags: [
        `qf-page:${CACHE_VERSION}:${config.env}:${mushafId}:${translationId}:${pageNumber}`,
      ],
    },
  )();
}
