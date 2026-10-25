import type {
  QfChapter,
  ReaderPage,
  ReaderVerse,
} from "@/lib/qf/types";

export interface TranslationFootnote {
  number: string;
  label: string;
  note: string | null;
}

export type TranslationPart =
  | { type: "text"; text: string }
  | ({ type: "footnote" } & TranslationFootnote);

const FOOTNOTE_PATTERN =
  /<sup[^>]*?foot_note=(?:"(\d+)"|'(\d+)'|(\d+))[^>]*>([\s\S]*?)<\/sup>/gi;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  nbsp: " ",
};

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name])
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTranslationParts(
  text: string,
  footNotes?: Record<string, string>,
): TranslationPart[] {
  const parts: TranslationPart[] = [];
  let lastIndex = 0;

  FOOTNOTE_PATTERN.lastIndex = 0;
  let match = FOOTNOTE_PATTERN.exec(text);

  while (match) {
    const before = stripHtml(text.slice(lastIndex, match.index));
    if (before) parts.push({ type: "text", text: before });

    const number = match[1] ?? match[2] ?? match[3];
    const label = stripHtml(match[4]) || number;

    parts.push({
      type: "footnote",
      number,
      label,
      note: footNotes?.[number] ? stripHtml(footNotes[number]) : null,
    });

    lastIndex = match.index + match[0].length;
    match = FOOTNOTE_PATTERN.exec(text);
  }

  const after = stripHtml(text.slice(lastIndex));
  if (after) parts.push({ type: "text", text: after });

  if (parts.length === 0) {
    const plain = stripHtml(text);
    if (plain) parts.push({ type: "text", text: plain });
  }

  return parts;
}

export function toArabicNumber(value: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)]);
}

export function verseBookmarkKey(verse: ReaderVerse): {
  key: string;
  surah: number;
  ayah: number;
} {
  const [surah, ayah] = verse.key.split(":").map(Number);
  return { key: verse.key, surah, ayah };
}

export function readerProgress(
  verses: ReaderVerse[],
  chapter: QfChapter | undefined,
): number {
  if (!chapter || chapter.verses_count <= 0 || verses.length === 0) return 0;

  const chapterVerses = verses.filter(
    (verse) => verse.chapterId === chapter.id,
  );
  const current = chapterVerses.at(-1) ?? verses.at(-1);
  if (!current) return 0;

  return Math.min(
    100,
    Math.max(0, Math.round((current.verseNumber / chapter.verses_count) * 100)),
  );
}

export function isJustifiedPage(page: ReaderPage): boolean {
  const chapterId = page.verses[0]?.chapterId;
  return chapterId !== 1 && !(chapterId === 2 && page.page.pageNumber === 2);
}

export function showsBismillah(verses: ReaderVerse[]): boolean {
  const first = verses[0];
  if (!first || first.verseNumber !== 1) return false;
  return first.chapterId !== 1 && first.chapterId !== 9;
}

export function pageChapter(
  chapters: QfChapter[],
  verses: ReaderVerse[],
): QfChapter | undefined {
  const chapterId = verses[0]?.chapterId;
  return chapters.find((chapter) => chapter.id === chapterId);
}
