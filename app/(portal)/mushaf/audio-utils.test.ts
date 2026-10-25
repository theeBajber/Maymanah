import { describe, expect, it } from "vitest";

import type { QfAudioSegment } from "@/lib/qf/types";

import {
  activeWordRange,
  audioProxyUrl,
  buildSurahTimeline,
  findTimelineEntry,
  formatTime,
  timelineDuration,
} from "./audio-utils";

const segments: QfAudioSegment[] = [
  [0, 1, 0, 900],
  [1, 2, 910, 1_800],
  [2, 4, 1_810, 3_000],
];

describe("formatTime", () => {
  it("formats whole seconds as minutes and padded seconds", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(83.9)).toBe("1:23");
    expect(formatTime(3_661)).toBe("1:01:01");
    expect(formatTime(7_140)).toBe("1:59:00");
  });

  it("handles invalid durations", () => {
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(-4)).toBe("0:00");
  });
});

describe("audioProxyUrl", () => {
  it("encodes the upstream address", () => {
    expect(audioProxyUrl("https://verses.quran.foundation/a b.mp3")).toBe(
      "/api/quran/audio?url=https%3A%2F%2Fverses.quran.foundation%2Fa%20b.mp3",
    );
  });
});

describe("activeWordRange", () => {
  it("finds the word range for the current time", () => {
    expect(activeWordRange(segments, 0.4)).toEqual({ start: 0, end: 1 });
    expect(activeWordRange(segments, 1.2)).toEqual({ start: 1, end: 2 });
    expect(activeWordRange(segments, 2.9)).toEqual({ start: 2, end: 4 });
  });

  it("returns null between segments and outside the audio", () => {
    expect(activeWordRange(segments, 0.905)).toBeNull();
    expect(activeWordRange(segments, 3)).toBeNull();
    expect(activeWordRange(segments, -1)).toBeNull();
  });
});

describe("buildSurahTimeline", () => {
  it("orders the surah by verse and accumulates segment durations", () => {
    const timeline = buildSurahTimeline(
      [
        {
          verseKey: "2:10",
          url: "https://example.com/10.mp3",
          pageNumber: 2,
          segments: [[0, 1, 0, 1_000]],
        },
        {
          verseKey: "2:2",
          url: "https://example.com/2.mp3",
          pageNumber: 2,
          segments: [
            [0, 1, 0, 2_000],
            [1, 2, 2_000, 3_500],
          ],
        },
        {
          verseKey: "1:1",
          url: "https://example.com/1.mp3",
          pageNumber: 1,
          segments: [[0, 1, 0, 500]],
        },
        {
          verseKey: "2:1",
          url: "https://example.com/1.mp3",
          pageNumber: 2,
          segments: [[0, 1, 30, 1_000]],
        },
      ],
      2,
    );

    expect(timeline).toEqual([
      { key: "2:1", pageNumber: 2, start: 0, duration: 1 },
      { key: "2:2", pageNumber: 2, start: 1, duration: 3.5 },
      { key: "2:10", pageNumber: 2, start: 4.5, duration: 1 },
    ]);
    expect(timelineDuration(timeline)).toBe(5.5);
  });

  it("handles a surah with no audio", () => {
    const timeline = buildSurahTimeline([], 2);
    expect(timeline).toEqual([]);
    expect(timelineDuration(timeline)).toBe(0);
    expect(findTimelineEntry(timeline, 10)).toBeNull();
  });
});

describe("findTimelineEntry", () => {
  const timeline = [
    { key: "2:1", pageNumber: 2, start: 0, duration: 1 },
    { key: "2:2", pageNumber: 2, start: 1, duration: 3.5 },
    { key: "2:10", pageNumber: 2, start: 4.5, duration: 1 },
  ];

  it("maps a surah time to its verse", () => {
    expect(findTimelineEntry(timeline, 0)?.key).toBe("2:1");
    expect(findTimelineEntry(timeline, 1)?.key).toBe("2:2");
    expect(findTimelineEntry(timeline, 4.4)?.key).toBe("2:2");
    expect(findTimelineEntry(timeline, 4.5)?.key).toBe("2:10");
  });

  it("clamps outside the surah bounds", () => {
    expect(findTimelineEntry(timeline, -4)?.key).toBe("2:1");
    expect(findTimelineEntry(timeline, 999)?.key).toBe("2:10");
  });
});
