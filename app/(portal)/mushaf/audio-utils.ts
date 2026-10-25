import type { QfAudioSegment, ReaderAudioFile } from "@/lib/qf/types";

export interface WordRange {
  start: number;
  end: number;
}

export interface SurahTimelineEntry {
  key: string;
  pageNumber?: number;
  start: number;
  duration: number;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const remainder = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainder,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function audioProxyUrl(url: string): string {
  return `/api/quran/audio?url=${encodeURIComponent(url)}`;
}

export function activeWordRange(
  segments: QfAudioSegment[],
  seconds: number,
): WordRange | null {
  if (!Number.isFinite(seconds) || seconds < 0) return null;

  const milliseconds = seconds * 1_000;
  const segment = segments.find(
    ([, , start, end]) => milliseconds >= start && milliseconds < end,
  );

  if (!segment || segment[1] <= segment[0]) return null;

  return { start: segment[0], end: segment[1] };
}

export function buildSurahTimeline(
  files: Iterable<ReaderAudioFile>,
  chapterId: number,
): SurahTimelineEntry[] {
  const ordered = Array.from(files)
    .filter(
      (file) => Number(file.verseKey.split(":")[0]) === chapterId,
    )
    .sort(
      (a, b) =>
        Number(a.verseKey.split(":")[1]) -
        Number(b.verseKey.split(":")[1]),
    );

  let cursor = 0;
  return ordered.map((file) => {
    const endMs = file.segments.reduce(
      (end, segment) => Math.max(end, segment[3]),
      0,
    );
    const duration = endMs / 1_000;
    const entry: SurahTimelineEntry = {
      key: file.verseKey,
      pageNumber: file.pageNumber,
      start: cursor,
      duration,
    };

    cursor += duration;
    return entry;
  });
}

export function timelineDuration(
  timeline: SurahTimelineEntry[],
): number {
  const last = timeline[timeline.length - 1];
  return last ? last.start + last.duration : 0;
}

export function findTimelineEntry(
  timeline: SurahTimelineEntry[],
  seconds: number,
): SurahTimelineEntry | null {
  if (timeline.length === 0) return null;

  const total = timelineDuration(timeline);
  const target = Math.min(Math.max(0, seconds), total);

  return (
    timeline.find(
      (entry) =>
        target >= entry.start && target < entry.start + entry.duration,
    ) ?? timeline[timeline.length - 1]
  );
}
