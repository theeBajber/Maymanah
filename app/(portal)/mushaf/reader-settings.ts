export const READER_SETTINGS_STORAGE_KEY = "maymanah.reader-settings.v1";

export const READER_MODES = ["verse", "reading"] as const;

export type ReaderMode = (typeof READER_MODES)[number];

export const READER_PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

export const READER_ARABIC_SIZES = [
  {
    value: "small",
    label: "Small",
    css: "clamp(1.75rem, 5.8vw, 2.05rem)",
  },
  {
    value: "medium",
    label: "Medium",
    css: "clamp(2rem, 6.6vw, 2.35rem)",
  },
  {
    value: "large",
    label: "Large",
    css: "clamp(2.2rem, 7.6vw, 2.7rem)",
  },
  {
    value: "xlarge",
    label: "Extra large",
    css: "clamp(2.4rem, 8.6vw, 3.05rem)",
  },
] as const;

export type ReaderArabicSize = (typeof READER_ARABIC_SIZES)[number]["value"];

export interface ReaderSettings {
  arabicSize: ReaderArabicSize;
  showTranslation: boolean;
  showWordTooltips: boolean;
  reciterId: number;
  mode: ReaderMode;
  playbackRate: number;
  muted: boolean;
  repeatVerse: boolean;
  autoplayNext: boolean;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  arabicSize: "medium",
  showTranslation: true,
  showWordTooltips: true,
  reciterId: 7,
  mode: "verse",
  playbackRate: 1,
  muted: false,
  repeatVerse: false,
  autoplayNext: true,
};

export interface ReaderSettingsStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

function isArabicSize(value: unknown): value is ReaderArabicSize {
  return READER_ARABIC_SIZES.some((size) => size.value === value);
}

function isReaderMode(value: unknown): value is ReaderMode {
  return READER_MODES.some((mode) => mode === value);
}

function isPlaybackRate(value: unknown): value is number {
  return READER_PLAYBACK_RATES.some((rate) => rate === value);
}

export function normalizeReaderSettings(value: unknown): ReaderSettings {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_READER_SETTINGS };
  }

  const record = value as Record<string, unknown>;
  const reciter = Number(record.reciterId);
  const reciterId =
    Number.isInteger(reciter) && reciter > 0 && reciter <= 9_999
      ? reciter
      : DEFAULT_READER_SETTINGS.reciterId;
  const playbackRate = Number(record.playbackRate);

  return {
    arabicSize: isArabicSize(record.arabicSize)
      ? record.arabicSize
      : DEFAULT_READER_SETTINGS.arabicSize,
    showTranslation:
      typeof record.showTranslation === "boolean"
        ? record.showTranslation
        : DEFAULT_READER_SETTINGS.showTranslation,
    showWordTooltips:
      typeof record.showWordTooltips === "boolean"
        ? record.showWordTooltips
        : DEFAULT_READER_SETTINGS.showWordTooltips,
    reciterId,
    mode: isReaderMode(record.mode)
      ? record.mode
      : DEFAULT_READER_SETTINGS.mode,
    playbackRate: isPlaybackRate(playbackRate)
      ? playbackRate
      : DEFAULT_READER_SETTINGS.playbackRate,
    muted:
      typeof record.muted === "boolean"
        ? record.muted
        : DEFAULT_READER_SETTINGS.muted,
    repeatVerse:
      typeof record.repeatVerse === "boolean"
        ? record.repeatVerse
        : DEFAULT_READER_SETTINGS.repeatVerse,
    autoplayNext:
      typeof record.autoplayNext === "boolean"
        ? record.autoplayNext
        : DEFAULT_READER_SETTINGS.autoplayNext,
  };
}

function browserStorage(): ReaderSettingsStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadReaderSettings(
  storage: ReaderSettingsStorage | null = browserStorage(),
): ReaderSettings {
  if (!storage) return { ...DEFAULT_READER_SETTINGS };

  try {
    const raw = storage.getItem(READER_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_READER_SETTINGS };
    return normalizeReaderSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_READER_SETTINGS };
  }
}

export function saveReaderSettings(
  settings: ReaderSettings,
  storage: ReaderSettingsStorage | null = browserStorage(),
): void {
  if (!storage) return;

  try {
    storage.setItem(
      READER_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizeReaderSettings(settings)),
    );
  } catch {
    // A full or blocked storage should never break the reader.
  }
}

export function arabicSizeCss(size: ReaderArabicSize): string {
  return (
    READER_ARABIC_SIZES.find((option) => option.value === size)?.css ??
    READER_ARABIC_SIZES[1].css
  );
}
