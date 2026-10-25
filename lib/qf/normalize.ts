import type {
  QfPage,
  QfTranslation,
  QfVerse,
  QfWord,
  ReaderLine,
  ReaderPage,
  ReaderTranslation,
  ReaderVerse,
  ReaderWord,
} from "./types";

interface NormalizePageInput {
  page: QfPage;
  verses: QfVerse[];
  mushafId: number;
}

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values));
}

function normalizeTranslation(
  translation: QfTranslation,
): ReaderTranslation {
  return {
    resourceId: translation.resource_id,
    resourceName: translation.resource_name,
    text: translation.text,
    languageName: translation.language_name,
    verseKey: translation.verse_key,
    footNotes: translation.foot_notes,
  };
}

function normalizeWord(word: QfWord, verse: QfVerse): ReaderWord {
  const verseKey = word.verse_key ?? verse.verse_key;

  return {
    key: `${verseKey}:${word.position}`,
    id: word.id,
    position: word.position,
    verseKey,
    pageNumber: word.page_number ?? verse.page_number ?? null,
    lineNumber: word.line_number ?? 0,
    v2Page: word.v2_page ?? verse.v2_page ?? null,
    charTypeName: word.char_type_name ?? "word",
    text:
      word.text_qpc_hafs ??
      word.text_uthmani ??
      word.text_indopak_nastaleeq ??
      "",
    textUthmani: word.text_uthmani,
    textQpcHafs: word.text_qpc_hafs,
    textIndopakNastaleeq: word.text_indopak_nastaleeq,
    codeV1: word.code_v1,
    codeV2: word.code_v2,
    audioUrl: word.audio_url,
    translation: word.translation?.text ?? null,
    transliteration: word.transliteration?.text ?? null,
  };
}

function normalizeVerse(verse: QfVerse): ReaderVerse {
  const words = (verse.words ?? []).map((word) => normalizeWord(word, verse));
  const chapterId =
    verse.chapter_id ?? Number.parseInt(verse.verse_key.split(":")[0], 10);

  return {
    id: verse.id,
    key: verse.verse_key,
    chapterId,
    verseNumber: verse.verse_number,
    pageNumber: verse.page_number,
    juzNumber: verse.juz_number,
    hizbNumber: verse.hizb_number,
    rubElHizbNumber: verse.rub_el_hizb_number,
    rukuNumber: verse.ruku_number,
    manzilNumber: verse.manzil_number,
    textUthmani: verse.text_uthmani,
    textIndopakNastaleeq: verse.text_indopak_nastaleeq,
    textUthmaniTajweed: verse.text_uthmani_tajweed,
    codeV1: verse.code_v1,
    codeV2: verse.code_v2,
    v1Page: verse.v1_page,
    v2Page: verse.v2_page,
    words,
    translations: (verse.translations ?? []).map(normalizeTranslation),
  };
}

function groupWordsIntoLines(verses: ReaderVerse[]): ReaderLine[] {
  const lines = new Map<number, ReaderLine>();

  for (const verse of verses) {
    for (const word of verse.words) {
      const line = lines.get(word.lineNumber);

      if (line) {
        line.words.push(word);
        if (!line.verseKeys.includes(word.verseKey)) {
          line.verseKeys.push(word.verseKey);
        }
      } else {
        lines.set(word.lineNumber, {
          lineNumber: word.lineNumber,
          verseKeys: [word.verseKey],
          words: [word],
        });
      }
    }
  }

  return Array.from(lines.values()).sort(
    (left, right) => left.lineNumber - right.lineNumber,
  );
}

export function normalizePage(input: NormalizePageInput): ReaderPage {
  const verses = input.verses.map(normalizeVerse);
  const lines = groupWordsIntoLines(verses);
  const verseMapping = input.page.verse_mapping ?? {};
  const mappingKeys = Object.keys(verseMapping);

  return {
    page: {
      pageNumber: input.page.page_number,
      mushafId: input.mushafId,
      verseMapping,
      firstVerseId: input.page.first_verse_id,
      lastVerseId: input.page.last_verse_id,
      versesCount: input.page.verses_count ?? verses.length,
      firstVerseKey: verses[0]?.key ?? mappingKeys[0],
      lastVerseKey: verses.at(-1)?.key ?? mappingKeys.at(-1),
      chapterIds: uniqueNumbers(verses.map((verse) => verse.chapterId)),
      juzNumbers: uniqueNumbers(verses.map((verse) => verse.juzNumber)),
      hizbNumbers: uniqueNumbers(verses.map((verse) => verse.hizbNumber)),
    },
    lines,
    verses,
  };
}
