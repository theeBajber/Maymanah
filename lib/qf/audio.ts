import type {
  QfAudioFile,
  QfAudioSegment,
  ReaderAudioFile,
} from "./types";

function isAudioSegment(value: number[]): value is QfAudioSegment {
  return (
    value.length >= 4 &&
    value.slice(0, 4).every((part) => Number.isFinite(part))
  );
}

export function resolveAudioUrl(
  url: string,
  mediaBaseUrl: string,
): string {
  const trimmed = url.trim();

  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (/^http:\/\//i.test(trimmed)) {
    return `https://${trimmed.slice("http://".length)}`;
  }

  return `${mediaBaseUrl.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeAudioFile(
  file: QfAudioFile,
  mediaBaseUrl: string,
): ReaderAudioFile {
  return {
    verseKey: file.verse_key,
    url: resolveAudioUrl(file.url, mediaBaseUrl),
    pageNumber: file.page_number,
    segments: (file.segments ?? [])
      .filter(isAudioSegment)
      .map(
        (segment): QfAudioSegment => [
          segment[0],
          segment[1],
          segment[2],
          segment[3],
        ],
      )
      .sort((a, b) => a[2] - b[2]),
  };
}
