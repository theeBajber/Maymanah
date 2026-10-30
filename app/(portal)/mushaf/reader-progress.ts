export const READER_PROGRESS_STORAGE_KEY = "maymanah.mushaf-progress.v1";

export interface ReaderProgress {
  pageNumber: number;
  verseKey: string | null;
}

export interface ReaderProgressStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

function isVerseKey(value: string): boolean {
  return /^\d{1,3}:\d{1,3}$/.test(value);
}

export function normalizeReaderProgress(
  value: unknown,
): ReaderProgress | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const pageNumber = record.pageNumber;
  if (
    typeof pageNumber !== "number" ||
    !Number.isInteger(pageNumber) ||
    pageNumber <= 0
  ) {
    return null;
  }

  return {
    pageNumber,
    verseKey:
      typeof record.verseKey === "string" && isVerseKey(record.verseKey)
        ? record.verseKey
        : null,
  };
}

function browserStorage(): ReaderProgressStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadReaderProgress(
  storage: ReaderProgressStorage | null = browserStorage(),
): ReaderProgress | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(READER_PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    return normalizeReaderProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveReaderProgress(
  progress: ReaderProgress,
  storage: ReaderProgressStorage | null = browserStorage(),
): void {
  const normalized = normalizeReaderProgress(progress);
  if (!storage || !normalized) return;

  try {
    storage.setItem(READER_PROGRESS_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // A full or blocked storage should never break the reader.
  }
}
