import { describe, expect, it } from "vitest";

import {
  loadReaderProgress,
  normalizeReaderProgress,
  READER_PROGRESS_STORAGE_KEY,
  saveReaderProgress,
  type ReaderProgressStorage,
} from "./reader-progress";

function memoryStorage(initial: Record<string, string> = {}): ReaderProgressStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("normalizeReaderProgress", () => {
  it("keeps a valid page and verse", () => {
    expect(
      normalizeReaderProgress({ pageNumber: 532, verseKey: "2:255" }),
    ).toEqual({ pageNumber: 532, verseKey: "2:255" });
  });

  it("drops an invalid verse key but keeps the page", () => {
    expect(
      normalizeReaderProgress({ pageNumber: 12, verseKey: "two" }),
    ).toEqual({ pageNumber: 12, verseKey: null });
  });

  it("rejects invalid pages", () => {
    expect(normalizeReaderProgress({ pageNumber: 0 })).toBeNull();
    expect(normalizeReaderProgress({ pageNumber: "12" })).toBeNull();
    expect(normalizeReaderProgress(null)).toBeNull();
  });
});

describe("loadReaderProgress", () => {
  it("returns null when nothing is stored", () => {
    expect(loadReaderProgress(memoryStorage())).toBeNull();
  });

  it("reads stored progress", () => {
    const storage = memoryStorage({
      [READER_PROGRESS_STORAGE_KEY]: JSON.stringify({
        pageNumber: 300,
        verseKey: "3:18",
      }),
    });

    expect(loadReaderProgress(storage)).toEqual({
      pageNumber: 300,
      verseKey: "3:18",
    });
  });

  it("recovers from corrupt JSON", () => {
    const storage = memoryStorage({
      [READER_PROGRESS_STORAGE_KEY]: "{not json",
    });

    expect(loadReaderProgress(storage)).toBeNull();
  });
});

describe("saveReaderProgress", () => {
  it("writes normalized progress", () => {
    const storage = memoryStorage();

    saveReaderProgress({ pageNumber: 50, verseKey: "4:1" }, storage);

    expect(
      JSON.parse(storage.getItem(READER_PROGRESS_STORAGE_KEY) ?? "null"),
    ).toEqual({ pageNumber: 50, verseKey: "4:1" });
  });

  it("ignores invalid data and storage failures", () => {
    const storage = memoryStorage();
    saveReaderProgress({ pageNumber: -1, verseKey: null }, storage);
    expect(storage.getItem(READER_PROGRESS_STORAGE_KEY)).toBeNull();

    const blocked: ReaderProgressStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(() =>
      saveReaderProgress({ pageNumber: 1, verseKey: null }, blocked),
    ).not.toThrow();
  });
});
