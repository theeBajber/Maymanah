/**
 * Time-zone arithmetic between a wall clock and an instant.
 *
 * Availability and recurring slots are stored as the time a person reads on
 * their own clock ("Mondays at 09:00"), not as UTC. Turning one into the other
 * therefore needs the zone's offset *on the date in question*: a fixed weekly
 * offset is wrong for half the year wherever daylight saving is observed, and
 * wrong in a different way for zones whose offset is not a whole hour. Every
 * function here resolves an offset against a concrete instant, never a
 * pattern, and nothing depends on the server's own time zone.
 */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    // `h23` keeps midnight as "00" rather than "24", which some ICU builds
    // emit under `hour12: false` and which would parse as the wrong day.
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** Whether a string names a time zone this runtime understands. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** The wall-clock reading in `timeZone` at a given instant. */
export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = formatterFor(timeZone).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    return part ? Number(part.value) : 0;
  };

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

/**
 * The zone's offset from UTC, in minutes, at a given instant.
 *
 * Positive east of Greenwich. Read from the wall clock the zone shows for that
 * instant, so it follows daylight saving automatically.
 */
export function getOffsetMinutes(timeZone: string, date: Date): number {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

/**
 * The instant at which a wall clock in `timeZone` reads the given time.
 *
 * Resolved in two passes: the first offset is only a guess, since it is read
 * at the wrong instant, and the second uses the instant that guess produced.
 * Where a clock jumps forward the requested time does not exist; it is mapped
 * to the instant an hour later rather than rejected, because the caller is
 * placing a recurring slot and a slot on a missing minute is still usable.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const firstOffset = getOffsetMinutes(timeZone, new Date(guess));
  let candidate = guess - firstOffset * 60_000;
  const secondOffset = getOffsetMinutes(timeZone, new Date(candidate));
  if (secondOffset !== firstOffset) {
    candidate = guess - secondOffset * 60_000;
  }
  return new Date(candidate);
}

/** The day of the week (0 = Sunday) of a calendar date, free of any zone. */
export function weekdayOfDate(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** The day of the week (0 = Sunday) that `timeZone` is observing at an instant. */
export function weekdayInZone(date: Date, timeZone: string): number {
  const parts = zonedParts(date, timeZone);
  return weekdayOfDate(parts.year, parts.month, parts.day);
}

/** "HH:mm" for a wall-clock hour and minute. Kept here so slots never format by hand. */
export function formatZonedTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
