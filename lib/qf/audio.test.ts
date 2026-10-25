import { describe, expect, it } from "vitest";

import { normalizeAudioFile, resolveAudioUrl } from "./audio";

describe("resolveAudioUrl", () => {
  it("joins relative QF media paths to the media base", () => {
    expect(
      resolveAudioUrl("Alafasy/mp3/002001.mp3", "https://verses.quran.foundation"),
    ).toBe("https://verses.quran.foundation/Alafasy/mp3/002001.mp3");
  });

  it("normalizes protocol-relative and insecure addresses", () => {
    expect(
      resolveAudioUrl(
        "//mirrors.quranicaudio.com/everyayah/Husary_64kbps/001001.mp3",
        "https://verses.quran.foundation",
      ),
    ).toBe(
      "https://mirrors.quranicaudio.com/everyayah/Husary_64kbps/001001.mp3",
    );
    expect(
      resolveAudioUrl(
        "http://example.com/audio.mp3",
        "https://verses.quran.foundation",
      ),
    ).toBe("https://example.com/audio.mp3");
  });
});

describe("normalizeAudioFile", () => {
  it("maps verse keys, resolves URLs, and sorts valid segments", () => {
    expect(
      normalizeAudioFile(
        {
          verse_key: "2:2",
          url: "Alafasy/mp3/002002.mp3",
          page_number: 2,
          segments: [
            [1, 2, 900, 1_800],
            [0, 1, 0, 890],
            [2],
          ],
        },
        "https://verses.quran.foundation",
      ),
    ).toEqual({
      verseKey: "2:2",
      url: "https://verses.quran.foundation/Alafasy/mp3/002002.mp3",
      pageNumber: 2,
      segments: [
        [0, 1, 0, 890],
        [1, 2, 900, 1_800],
      ],
    });
  });

  it("returns an empty segment list when timings are missing", () => {
    expect(
      normalizeAudioFile(
        {
          verse_key: "1:1",
          url: "Alafasy/mp3/001001.mp3",
        },
        "https://verses.quran.foundation",
      ).segments,
    ).toEqual([]);
  });
});
