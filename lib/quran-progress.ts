import "server-only";

import { memorizationPercentFromAyahs } from "./course-completion";
import { db } from "./db";
import {
  absoluteAyah,
  positionToAyah,
  surahByNumber,
  type AyahRangeInput,
} from "./quran-meta";

/** A contiguous span of ayahs, counted from the start of the whole Quran. */
export interface AyahInterval {
  start: number;
  end: number;
}

/**
 * Converts stored ranges into whole-Quran intervals.
 *
 * A range that names an unknown surah or ayah is skipped rather than widened,
 * so one bad row cannot inflate a student's progress. Validation at write time
 * means this should never happen; it is a guard, not the rule.
 */
export function rangeIntervals(ranges: readonly AyahRangeInput[]): AyahInterval[] {
  const intervals: AyahInterval[] = [];

  for (const range of ranges) {
    const start = absoluteAyah(range.fromSurah, range.fromAyah);
    const end = absoluteAyah(range.toSurah, range.toAyah);
    if (start === null || end === null || start > end) continue;
    intervals.push({ start, end });
  }

  return intervals;
}

/**
 * Merges overlapping and adjacent spans.
 *
 * Adjacency counts as overlap because consecutive ayahs belong to one block:
 * 2:1–5 and 2:6–10 are ten ayahs, not two separate claims.
 */
export function mergeIntervals(intervals: readonly AyahInterval[]): AyahInterval[] {
  const sorted = [...intervals].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: AyahInterval[] = [];

  for (const current of sorted) {
    const last = merged[merged.length - 1];
    if (last && current.start <= last.end + 1) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/** How many distinct ayahs a set of ranges covers. */
export function uniqueAyahCount(ranges: readonly AyahRangeInput[]): number {
  return mergeIntervals(rangeIntervals(ranges)).reduce(
    (total, interval) => total + interval.end - interval.start + 1,
    0,
  );
}

/**
 * Percentage of the Quran newly memorised, rounded to one decimal.
 *
 * Revision is not represented here at all: only ranges recorded as new
 * memorisation reach the ledger, so repeating an old juz never moves the bar.
 */
export function memorizationPercent(ranges: readonly AyahRangeInput[]): number {
  return memorizationPercentFromAyahs(uniqueAyahCount(ranges));
}

/**
 * The furthest ayah reached, or null when nothing is memorised yet.
 *
 * This is the student's position, not their latest entry: memorising out of
 * order must not send the reported position backwards.
 */
export function lastMemorizedAyah(
  ranges: readonly AyahRangeInput[],
): { surah: number; ayah: number } | null {
  const merged = mergeIntervals(rangeIntervals(ranges));
  const last = merged[merged.length - 1];
  if (!last) return null;
  return positionToAyah(last.end);
}

export interface MemorizationProgress {
  rangeCount: number;
  uniqueAyahs: number;
  percent: number;
  lastStop: { surah: number; ayah: number; surahName: string } | null;
  updatedAt: Date | null;
}

/** Reads a student's memorisation ledger and summarises it for display. */
export async function memorizationProgress(studentId: string): Promise<MemorizationProgress> {
  const rows = await db.memorizedRange.findMany({
    where: { studentId },
    select: {
      startSurah: true,
      startAyah: true,
      endSurah: true,
      endAyah: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const ranges = rows.map((row) => ({
    fromSurah: row.startSurah,
    fromAyah: row.startAyah,
    toSurah: row.endSurah,
    toAyah: row.endAyah,
  }));
  const last = lastMemorizedAyah(ranges);

  return {
    rangeCount: rows.length,
    uniqueAyahs: uniqueAyahCount(ranges),
    percent: memorizationPercent(ranges),
    lastStop: last
      ? { ...last, surahName: surahByNumber(last.surah)?.name ?? `Surah ${last.surah}` }
      : null,
    updatedAt: rows.length > 0 ? rows[rows.length - 1].createdAt : null,
  };
}
