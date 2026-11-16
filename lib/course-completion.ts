import { TOTAL_QURAN_AYAHS } from "./quran-meta";

/**
 * The course measured by how much of the Quran a student has memorised.
 *
 * Hifdh has no visible curriculum, and a recurring live session has no end, so
 * "all lessons done" is the wrong finish line. Memorisation already has an
 * honest one: every ayah.
 */
export const HIFDH_SLUG = "hifdh-ul-quran";

export type CompletionMode = "lessons" | "memorization";

/** Which finish line belongs to a course, decided once by its slug. */
export function completionModeFor(slug: string): CompletionMode {
  return slug === HIFDH_SLUG ? "memorization" : "lessons";
}

/** Percentage of the Quran covered by the memorisation ledger, to one decimal. */
export function memorizationPercentFromAyahs(uniqueAyahs: number): number {
  if (uniqueAyahs <= 0) return 0;
  const percent = (uniqueAyahs / TOTAL_QURAN_AYAHS) * 100;
  return Math.min(100, Math.round(percent * 10) / 10);
}

/** The whole Quran is the finish line; a rounded 100% short of it is not. */
export function memorizationComplete(uniqueAyahs: number): boolean {
  return uniqueAyahs >= TOTAL_QURAN_AYAHS;
}

export interface CompletionInput {
  mode: CompletionMode;
  /** Published lessons the reader has finished (lessons mode). */
  completedLessons: number;
  /** Published lessons in the course (lessons mode). */
  lessonCount: number;
  /** Distinct ayahs memorised (memorization mode). */
  memorizedAyahs?: number;
}

export interface CompletionState {
  completed: boolean;
  /** Percent used for every progress display on this course. */
  progress: number;
}

/**
 * The single rule for "this course is finished".
 *
 * The page, the exam endpoint, and the review endpoint all read it, so a
 * direct request cannot reach a later step than the screen would allow.
 */
export function evaluateCompletion({
  mode,
  completedLessons,
  lessonCount,
  memorizedAyahs = 0,
}: CompletionInput): CompletionState {
  if (mode === "memorization") {
    return {
      completed: memorizationComplete(memorizedAyahs),
      progress: memorizationPercentFromAyahs(memorizedAyahs),
    };
  }

  return {
    completed: lessonCount > 0 && completedLessons >= lessonCount,
    progress: lessonCount === 0 ? 0 : Math.round((completedLessons / lessonCount) * 100),
  };
}
