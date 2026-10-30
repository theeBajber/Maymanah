import { describe, expect, it } from "vitest";

import {
  arabicSizeCss,
  DEFAULT_READER_SETTINGS,
  loadReaderSettings,
  normalizeReaderSettings,
  READER_SETTINGS_STORAGE_KEY,
  saveReaderSettings,
  type ReaderSettingsStorage,
} from "./reader-settings";

function memoryStorage(initial: Record<string, string> = {}): ReaderSettingsStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("normalizeReaderSettings", () => {
  it("keeps valid settings", () => {
    expect(
      normalizeReaderSettings({
        arabicSize: "large",
        showTranslation: false,
        showWordTooltips: false,
        reciterId: 7,
        mode: "reading",
        playbackRate: 1.5,
        muted: true,
        repeatVerse: true,
        autoplayNext: false,
      }),
    ).toEqual({
      arabicSize: "large",
      showTranslation: false,
      showWordTooltips: false,
      reciterId: 7,
      mode: "reading",
      playbackRate: 1.5,
      muted: true,
      repeatVerse: true,
      autoplayNext: false,
    });
  });

  it("falls back field by field for invalid values", () => {
    expect(
      normalizeReaderSettings({
        arabicSize: "giant",
        showTranslation: "yes",
        showWordTooltips: 0,
        reciterId: -4,
        mode: "scroll",
        playbackRate: 3,
        muted: "no",
        repeatVerse: 1,
        autoplayNext: null,
      }),
    ).toEqual(DEFAULT_READER_SETTINGS);
  });

  it("rejects non-object input", () => {
    expect(normalizeReaderSettings(null)).toEqual(DEFAULT_READER_SETTINGS);
    expect(normalizeReaderSettings("large")).toEqual(DEFAULT_READER_SETTINGS);
  });
});

describe("loadReaderSettings", () => {
  it("returns defaults when nothing is stored", () => {
    expect(loadReaderSettings(memoryStorage())).toEqual(
      DEFAULT_READER_SETTINGS,
    );
  });

  it("reads and normalizes a stored payload", () => {
    const storage = memoryStorage({
      [READER_SETTINGS_STORAGE_KEY]: JSON.stringify({
        arabicSize: "xlarge",
        showTranslation: false,
        showWordTooltips: true,
        reciterId: 3,
        mode: "reading",
        playbackRate: 2,
        muted: true,
        repeatVerse: false,
        autoplayNext: false,
      }),
    });

    expect(loadReaderSettings(storage)).toEqual({
      arabicSize: "xlarge",
      showTranslation: false,
      showWordTooltips: true,
      reciterId: 3,
      mode: "reading",
      playbackRate: 2,
      muted: true,
      repeatVerse: false,
      autoplayNext: false,
    });
  });

  it("recovers from corrupt JSON", () => {
    const storage = memoryStorage({
      [READER_SETTINGS_STORAGE_KEY]: "{not json",
    });

    expect(loadReaderSettings(storage)).toEqual(DEFAULT_READER_SETTINGS);
  });
});

describe("saveReaderSettings", () => {
  it("writes a normalized payload", () => {
    const storage = memoryStorage();

    saveReaderSettings(
      {
        arabicSize: "large",
        showTranslation: true,
        showWordTooltips: false,
        reciterId: 12,
        mode: "reading",
        playbackRate: 0.75,
        muted: false,
        repeatVerse: true,
        autoplayNext: true,
      },
      storage,
    );

    expect(
      JSON.parse(storage.getItem(READER_SETTINGS_STORAGE_KEY) ?? "null"),
    ).toEqual({
      arabicSize: "large",
      showTranslation: true,
      showWordTooltips: false,
      reciterId: 12,
      mode: "reading",
      playbackRate: 0.75,
      muted: false,
      repeatVerse: true,
      autoplayNext: true,
    });
  });

  it("ignores storage failures", () => {
    const storage: ReaderSettingsStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(() => saveReaderSettings(DEFAULT_READER_SETTINGS, storage)).not.toThrow();
  });
});

describe("arabicSizeCss", () => {
  it("maps every size to a clamp rule", () => {
    expect(arabicSizeCss("small")).toContain("clamp(");
    expect(arabicSizeCss("medium")).toContain("clamp(");
    expect(arabicSizeCss("large")).toContain("clamp(");
    expect(arabicSizeCss("xlarge")).toContain("clamp(");
  });
});
