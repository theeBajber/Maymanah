export interface QfTranslatedName {
  language_name: string;
  name: string;
}

export interface QfChapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: QfTranslatedName;
}

export interface QfJuz {
  id: number;
  juz_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface QfPage {
  id: number;
  page_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id?: number;
  last_verse_id?: number;
  verses_count?: number;
}

export interface QfWordTranslation {
  text: string;
  language_name?: string;
}

export interface QfWord {
  id?: number;
  position: number;
  verse_key?: string;
  page_number?: number | null;
  line_number?: number | null;
  v1_page?: number | null;
  v2_page?: number | null;
  char_type_name?: string;
  text_uthmani?: string | null;
  text_uthmani_simple?: string | null;
  text_qpc_hafs?: string | null;
  text_indopak?: string | null;
  text_indopak_nastaleeq?: string | null;
  text_imlaei?: string | null;
  code_v1?: string | null;
  code_v2?: string | null;
  audio_url?: string | null;
  translation?: QfWordTranslation | null;
  transliteration?: QfWordTranslation | null;
}

export interface QfTranslation {
  resource_id: number;
  resource_name?: string;
  id?: number;
  text: string;
  language_id?: number;
  language_name?: string;
  verse_key?: string;
  chapter_id?: number;
  verse_number?: number;
  juz_number?: number;
  hizb_number?: number;
  page_number?: number;
  rub_el_hizb_number?: number;
  ruku_number?: number;
  manzil_number?: number;
  foot_notes?: Record<string, string>;
}

export interface QfVerse {
  id: number;
  chapter_id?: number;
  verse_number: number;
  verse_key: string;
  verse_index?: number;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number?: number;
  manzil_number?: number;
  sajdah_number?: number | null;
  text_uthmani?: string;
  text_indopak_nastaleeq?: string | null;
  text_uthmani_tajweed?: string;
  code_v1?: string;
  code_v2?: string;
  v1_page?: number;
  v2_page?: number;
  words?: QfWord[];
  translations?: QfTranslation[];
}

export interface QfPagination {
  per_page: number;
  current_page: number;
  next_page: number | null;
  total_pages: number;
  total_records: number;
}

export interface QfChaptersResponse {
  chapters: QfChapter[];
}

export interface QfJuzsResponse {
  juzs: QfJuz[];
}

export interface QfPageResponse {
  page: QfPage;
}

export interface QfVersesResponse {
  verses: QfVerse[];
  pagination?: QfPagination;
}

export interface QfRecitation {
  id: number;
  reciter_name: string;
  style?: string | null;
  translated_name?: QfTranslatedName | null;
}

export interface QfRecitationsResponse {
  recitations: QfRecitation[];
}

export type QfAudioSegment = [number, number, number, number];

export interface QfAudioFile {
  verse_key: string;
  url: string;
  page_number?: number;
  segments?: number[][];
}

export interface QfAudioFilesResponse {
  audio_files: QfAudioFile[];
  pagination?: QfPagination;
}

export interface ReaderAudioFile {
  verseKey: string;
  url: string;
  pageNumber?: number;
  segments: QfAudioSegment[];
}

export interface ReaderTranslation {
  resourceId: number;
  resourceName?: string;
  text: string;
  languageName?: string;
  verseKey?: string;
  footNotes?: Record<string, string>;
}

export interface ReaderWord {
  key: string;
  id?: number;
  position: number;
  verseKey: string;
  pageNumber: number | null;
  lineNumber: number;
  v2Page: number | null;
  charTypeName: string;
  text: string;
  textUthmani?: string | null;
  textQpcHafs?: string | null;
  textIndopakNastaleeq?: string | null;
  codeV1?: string | null;
  codeV2?: string | null;
  audioUrl?: string | null;
  translation?: string | null;
  transliteration?: string | null;
}

export interface ReaderLine {
  lineNumber: number;
  verseKeys: string[];
  words: ReaderWord[];
}

export interface ReaderVerse {
  id: number;
  key: string;
  chapterId: number;
  verseNumber: number;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubElHizbNumber: number;
  rukuNumber?: number;
  manzilNumber?: number;
  textUthmani?: string;
  textIndopakNastaleeq?: string | null;
  textUthmaniTajweed?: string;
  codeV1?: string;
  codeV2?: string;
  v1Page?: number;
  v2Page?: number;
  words: ReaderWord[];
  translations: ReaderTranslation[];
}

export interface ReaderPageMeta {
  pageNumber: number;
  mushafId: number;
  verseMapping: Record<string, string>;
  firstVerseId?: number;
  lastVerseId?: number;
  versesCount?: number;
  firstVerseKey?: string;
  lastVerseKey?: string;
  chapterIds: number[];
  juzNumbers: number[];
  hizbNumbers: number[];
}

export interface ReaderPage {
  page: ReaderPageMeta;
  lines: ReaderLine[];
  verses: ReaderVerse[];
}

export interface QuranCatalog {
  chapters: QfChapter[];
  juzs: QfJuz[];
}
