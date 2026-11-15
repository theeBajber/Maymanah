import type { AyahRangeInput } from "./quran-meta";

/**
 * Live-session calculations shared by the server and the browser.
 *
 * The join window is computed on the server and handed to the UI as a state
 * plus two timestamps. Nothing here reads the browser clock for that decision:
 * a client clock can be wrong, and the join route remains the authority.
 */

/** A lesson is joinable from fifteen minutes before it starts... */
export const JOIN_EARLY_MS = 15 * 60 * 1000;

/** ...until an hour after it was meant to end, for sessions that run over. */
export const JOIN_LATE_MS = 60 * 60 * 1000;

/** Used when a session has no recorded end time. */
export const DEFAULT_LESSON_MS = 60 * 60 * 1000;

export type JoinState = "upcoming" | "open" | "ended" | "cancelled";

export interface JoinWindow {
  opensAt: Date;
  closesAt: Date;
}

export interface JoinStatus extends JoinWindow {
  state: JoinState;
}

export function joinWindow(startTime: Date, endTime: Date | null): JoinWindow {
  const start = startTime.getTime();
  const end = endTime?.getTime() ?? start + DEFAULT_LESSON_MS;

  return {
    opensAt: new Date(start - JOIN_EARLY_MS),
    closesAt: new Date(end + JOIN_LATE_MS),
  };
}

/**
 * The server's answer to "can this be joined right now?".
 *
 * A cancelled session is never joinable. A completed one reads as ended even
 * during the late window, because the report has already closed the lesson.
 */
export function joinStateFor(input: {
  startTime: Date;
  endTime: Date | null;
  status: string;
  now?: Date;
}): JoinStatus {
  const window = joinWindow(input.startTime, input.endTime);
  const now = (input.now ?? new Date()).getTime();

  if (input.status === "CANCELLED") return { ...window, state: "cancelled" };
  if (input.status === "COMPLETED") return { ...window, state: "ended" };
  if (now < window.opensAt.getTime()) return { ...window, state: "upcoming" };
  if (now > window.closesAt.getTime()) return { ...window, state: "ended" };
  return { ...window, state: "open" };
}

export interface FeaturableSession {
  id: string;
  startTime: string;
  joinState: JoinState;
}

/** A date key in the viewer's own calendar, used only for grouping. */
export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Picks the lesson the screen leads with.
 *
 * A room that is open right now wins. Otherwise today's earliest upcoming
 * lesson leads, then the one that just ended today, then the next one on the
 * calendar. `todayKey` is the browser's local day, resolved after mount; the
 * join state itself always comes from the server.
 */
export function pickFeaturedSession<T extends FeaturableSession>(
  sessions: readonly T[],
  todayKey: string | null,
): T | null {
  const open = sessions.find((session) => session.joinState === "open");
  if (open) return open;

  if (todayKey) {
    const today = sessions.filter(
      (session) => localDayKey(new Date(session.startTime)) === todayKey,
    );
    const todayUpcoming = today.find((session) => session.joinState === "upcoming");
    if (todayUpcoming) return todayUpcoming;

    const endedToday = today
      .filter((session) => session.joinState === "ended")
      .sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    if (endedToday.length > 0) return endedToday[endedToday.length - 1];
  }

  return sessions.find((session) => session.joinState === "upcoming") ?? null;
}

export interface SurahLike {
  number: number;
  name: string;
  ayahCount: number;
}

export type RangeCheck =
  | { valid: true; ayahs: number }
  | { valid: false; reason: "unknown_surah" | "ayah_out_of_range" | "empty_range" };

/**
 * Validates a range against the rows shown in the dropdowns.
 *
 * The server repeats this check against `surah_meta`; sharing the rule here
 * keeps the live hint honest without letting the client become the authority.
 */
export function checkRange(
  range: AyahRangeInput,
  surahs: readonly SurahLike[],
): RangeCheck {
  const from = surahs.find((row) => row.number === range.fromSurah);
  const to = surahs.find((row) => row.number === range.toSurah);
  if (!from || !to) return { valid: false, reason: "unknown_surah" };

  if (
    !Number.isInteger(range.fromAyah) ||
    !Number.isInteger(range.toAyah) ||
    range.fromAyah < 1 ||
    range.fromAyah > from.ayahCount ||
    range.toAyah < 1 ||
    range.toAyah > to.ayahCount
  ) {
    return { valid: false, reason: "ayah_out_of_range" };
  }

  const startsAfterEnd =
    range.fromSurah > range.toSurah ||
    (range.fromSurah === range.toSurah && range.fromAyah > range.toAyah);
  if (startsAfterEnd) return { valid: false, reason: "empty_range" };

  if (range.fromSurah === range.toSurah) {
    return { valid: true, ayahs: range.toAyah - range.fromAyah + 1 };
  }

  let ayahs = from.ayahCount - range.fromAyah + 1 + range.toAyah;
  for (let number = range.fromSurah + 1; number < range.toSurah; number += 1) {
    const middle = surahs.find((row) => row.number === number);
    if (!middle) return { valid: false, reason: "unknown_surah" };
    ayahs += middle.ayahCount;
  }

  return { valid: true, ayahs };
}

function countLabel(value: number): string {
  return value.toLocaleString("en-US");
}

export interface RangeHint {
  valid: boolean;
  message: string;
  ayahs?: number;
}

/** The sentence under the report's range pickers. */
export function rangeHint(range: AyahRangeInput, surahs: readonly SurahLike[]): RangeHint {
  const check = checkRange(range, surahs);

  if (!check.valid) {
    if (check.reason === "unknown_surah") {
      return { valid: false, message: "Choose a surah for both ends of the range." };
    }
    if (check.reason === "empty_range") {
      return {
        valid: false,
        message: "The end of the range must not come before the start.",
      };
    }

    const from = surahs.find((row) => row.number === range.fromSurah);
    const to = surahs.find((row) => row.number === range.toSurah);
    const broken =
      !from || !Number.isInteger(range.fromAyah) || range.fromAyah < 1 || range.fromAyah > from.ayahCount
        ? { row: from, ayah: range.fromAyah }
        : { row: to, ayah: range.toAyah };

    if (!broken.row) {
      return { valid: false, message: "That ayah does not exist in the chosen surah." };
    }
    return {
      valid: false,
      message: `${broken.row.name} has ${countLabel(broken.row.ayahCount)} ayahs, so ayah ${countLabel(broken.ayah)} does not exist.`,
    };
  }

  const from = surahs.find((row) => row.number === range.fromSurah);
  const to = surahs.find((row) => row.number === range.toSurah);
  const ayahs = countLabel(check.ayahs);

  if (range.fromSurah === range.toSurah && from) {
    return {
      valid: true,
      ayahs: check.ayahs,
      message: `Valid range · ${ayahs} ayahs · ${from.name} has ${countLabel(from.ayahCount)}`,
    };
  }

  return {
    valid: true,
    ayahs: check.ayahs,
    message: from && to
      ? `Valid range · ${ayahs} ayahs · ${from.name} ${range.fromSurah}:${range.fromAyah} → ${to.name} ${range.toSurah}:${range.toAyah}`
      : `Valid range · ${ayahs} ayahs`,
  };
}

/** The next ayah in the whole Quran, or null after 114:6. */
export function nextAyahAfter(
  position: { surah: number; ayah: number },
  surahs: readonly SurahLike[],
): { surah: number; ayah: number } | null {
  const index = surahs.findIndex((row) => row.number === position.surah);
  if (index === -1) return null;

  const current = surahs[index];
  if (position.ayah < current.ayahCount) {
    return { surah: current.number, ayah: position.ayah + 1 };
  }

  const next = surahs[index + 1];
  return next ? { surah: next.number, ayah: 1 } : null;
}

export interface PlanRange {
  fromSurah: number;
  fromVerse: number;
  toSurah: number;
  toVerse: number;
}

/** A readable range using the surah rows the page already has. */
export function planRangeLabel(range: PlanRange, surahs: readonly SurahLike[]): string {
  const from = surahs.find((row) => row.number === range.fromSurah);
  const to = surahs.find((row) => row.number === range.toSurah);
  const fromName = from?.name ?? `Surah ${range.fromSurah}`;
  const toName = to?.name ?? `Surah ${range.toSurah}`;

  if (range.fromSurah === range.toSurah && range.fromVerse === range.toVerse) {
    return `${fromName} ${range.fromSurah}:${range.fromVerse}`;
  }
  if (range.fromSurah === range.toSurah) {
    return `${fromName} ${range.fromSurah}:${range.fromVerse}–${range.toVerse}`;
  }
  return `${fromName} ${range.fromSurah}:${range.fromVerse} – ${toName} ${range.toSurah}:${range.toVerse}`;
}

/**
 * A starting point for the next-assignment field.
 *
 * The next scheduled lesson's plan wins, since that is what the student will
 * actually be asked for; otherwise the teacher is offered the ayah after the
 * student's current stopping point. Always editable.
 */
export function suggestedNextAssignment(input: {
  nextPlan: PlanRange | null;
  lastStop: { surah: number; ayah: number } | null;
  surahs: readonly SurahLike[];
}): string {
  if (input.nextPlan) {
    return `Prepare ${planRangeLabel(input.nextPlan, input.surahs)} for the next lesson.`;
  }

  if (!input.lastStop) return "";

  const next = nextAyahAfter(input.lastStop, input.surahs);
  if (!next) return "You have reached the end of the Quran — revise what you have memorised.";

  const name = input.surahs.find((row) => row.number === next.surah)?.name ?? `Surah ${next.surah}`;
  return `Continue from ${name} ${next.surah}:${next.ayah}.`;
}

/** True when a phrase is already part of the revision note. */
export function revisionPhraseExists(revision: string, phrase: string): boolean {
  return phrase.trim().length > 0 && revision.includes(phrase.trim());
}

/**
 * Adds or removes one revision phrase without discarding what the teacher
 * typed by hand. Removing a phrase also cleans the separator it leaves behind.
 */
export function toggleRevisionPhrase(revision: string, phrase: string): string {
  const target = phrase.trim();
  if (!target) return revision;

  const parts = revision
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const next = revision.includes(target)
    ? parts
        .map((part) => (part === target ? "" : part.replace(target, "").trim()))
        .filter(Boolean)
    : [...parts, target];

  return next.join(", ");
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  DAILY_HIFDH: "Memorisation",
  MURAJA: "Review",
  EXTRA: "Extra session",
};

export function sessionTypeLabel(type: string): string {
  return SESSION_TYPE_LABELS[type] ?? "Session";
}
