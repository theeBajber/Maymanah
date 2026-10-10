/**
 * Time arithmetic for scheduling, kept free of dates and databases.
 *
 * Everything here works in minutes past midnight against 24-hour strings, so
 * the same functions serve availability windows, recurring slots, and booked
 * sessions without any of them needing to know about the others.
 */

/** "09:30" to minutes past midnight. Returns null for anything malformed. */
export function timeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes past midnight back to a 24-hour string. */
export function minutesToTime(minutes: number): string {
  const clamped = Math.min(24 * 60 - 1, Math.max(0, Math.round(minutes)));
  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
}

export interface TimeWindow {
  startTime: string;
  endTime: string;
}

/**
 * Whether two windows on the same day overlap.
 *
 * Touching at exactly one endpoint is not an overlap: a session ending at
 * ten and another starting at ten share no minute.
 */
export function windowsOverlap(a: TimeWindow, b: TimeWindow): boolean {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);

  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return true;
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Subtracts booked windows from availability windows.
 *
 * A malformed window on either side removes the whole availability it touches,
 * since guessing what was meant by a bad time is worse than showing nothing.
 */
export function subtractBooked(availability: TimeWindow[], booked: TimeWindow[]): TimeWindow[] {
  const result: TimeWindow[] = [];

  for (const window of availability) {
    const start = timeToMinutes(window.startTime);
    const end = timeToMinutes(window.endTime);
    if (start === null || end === null || end <= start) continue;

    let fragments: { start: number; end: number }[] = [{ start, end }];

    for (const booking of booked) {
      const bStart = timeToMinutes(booking.startTime);
      const bEnd = timeToMinutes(booking.endTime);
      if (bStart === null || bEnd === null || bEnd <= bStart) {
        fragments = [];
        break;
      }

      const next: { start: number; end: number }[] = [];
      for (const fragment of fragments) {
        if (bEnd <= fragment.start || bStart >= fragment.end) {
          next.push(fragment);
          continue;
        }
        if (bStart > fragment.start) next.push({ start: fragment.start, end: bStart });
        if (bEnd < fragment.end) next.push({ start: bEnd, end: fragment.end });
      }
      fragments = next;
    }

    for (const fragment of fragments) {
      result.push({ startTime: minutesToTime(fragment.start), endTime: minutesToTime(fragment.end) });
    }
  }

  return result;
}

/**
 * Splits windows into bookable sessions of a fixed length.
 *
 * A remainder shorter than the session is dropped rather than offered as a
 * stunted session, since a twenty-minute slot sold as an hour wastes
 * everybody's time.
 */
export function splitIntoSessions(windows: TimeWindow[], durationMinutes: number): TimeWindow[] {
  const sessions: TimeWindow[] = [];

  for (const window of windows) {
    const start = timeToMinutes(window.startTime);
    const end = timeToMinutes(window.endTime);
    if (start === null || end === null) continue;

    for (let cursor = start; cursor + durationMinutes <= end; cursor += durationMinutes) {
      sessions.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(cursor + durationMinutes) });
    }
  }

  return sessions;
}
