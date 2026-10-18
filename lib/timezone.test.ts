import { describe, expect, it } from "vitest";

import {
  formatZonedTime,
  getOffsetMinutes,
  isValidTimeZone,
  weekdayInZone,
  weekdayOfDate,
  zonedParts,
  zonedTimeToUtc,
} from "./timezone";

describe("isValidTimeZone", () => {
  it("accepts a real zone and rejects a made-up one", () => {
    expect(isValidTimeZone("Africa/Nairobi")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
  });
});

describe("getOffsetMinutes", () => {
  it("reads whole-hour zones east of Greenwich", () => {
    expect(getOffsetMinutes("Africa/Nairobi", new Date("2026-06-15T12:00:00Z"))).toBe(180);
    expect(getOffsetMinutes("UTC", new Date("2026-06-15T12:00:00Z"))).toBe(0);
  });

  it("reads zones whose offset is not a whole hour", () => {
    expect(getOffsetMinutes("Asia/Kolkata", new Date("2026-06-15T12:00:00Z"))).toBe(330);
    expect(getOffsetMinutes("Asia/Kathmandu", new Date("2026-06-15T12:00:00Z"))).toBe(345);
  });

  it("follows daylight saving in the same zone", () => {
    expect(getOffsetMinutes("America/New_York", new Date("2026-01-15T17:00:00Z"))).toBe(-300);
    expect(getOffsetMinutes("America/New_York", new Date("2026-07-15T16:00:00Z"))).toBe(-240);
  });
});

describe("zonedTimeToUtc", () => {
  it("maps a wall clock to the instant it names", () => {
    expect(zonedTimeToUtc(2026, 6, 15, 9, 0, "Africa/Nairobi").toISOString()).toBe("2026-06-15T06:00:00.000Z");
    expect(zonedTimeToUtc(2026, 6, 15, 9, 0, "Asia/Kolkata").toISOString()).toBe("2026-06-15T03:30:00.000Z");
  });

  it("uses the offset in force on that date, not one fixed for the zone", () => {
    // The same 09:00 wall clock is a different instant either side of the
    // spring change, which a single stored offset could never express.
    expect(zonedTimeToUtc(2026, 3, 7, 9, 0, "America/New_York").toISOString()).toBe("2026-03-07T14:00:00.000Z");
    expect(zonedTimeToUtc(2026, 3, 9, 9, 0, "America/New_York").toISOString()).toBe("2026-03-09T13:00:00.000Z");
  });

  it("round-trips a wall clock through its instant", () => {
    const instant = zonedTimeToUtc(2026, 10, 25, 14, 45, "Europe/Berlin");
    expect(zonedParts(instant, "Europe/Berlin")).toMatchObject({ hour: 14, minute: 45 });
  });

  it("returns something usable for a time the clock skips", () => {
    // 02:30 does not exist on this date in New York; the contract is that the
    // function still yields a valid instant rather than throwing.
    const instant = zonedTimeToUtc(2026, 3, 8, 2, 30, "America/New_York");
    expect(Number.isFinite(instant.getTime())).toBe(true);
    expect([1, 2, 3]).toContain(zonedParts(instant, "America/New_York").hour);
  });
});

describe("weekday helpers", () => {
  it("reads the weekday of a calendar date", () => {
    expect(weekdayOfDate(2026, 1, 1)).toBe(4); // Thursday
    expect(weekdayOfDate(2026, 6, 14)).toBe(0); // Sunday
  });

  it("reads the weekday the zone is observing, not UTC's", () => {
    const noonInUtc = new Date("2026-01-01T12:00:00Z"); // Thursday in UTC
    expect(weekdayInZone(noonInUtc, "UTC")).toBe(4);
    expect(weekdayInZone(noonInUtc, "Pacific/Kiritimati")).toBe(5); // already Friday
  });

  it("crosses midnight for a zone far enough ahead", () => {
    const lateInUtc = new Date("2026-01-01T22:00:00Z"); // Thursday
    expect(weekdayInZone(lateInUtc, "Africa/Nairobi")).toBe(5); // Friday, 01:00
  });
});

describe("formatZonedTime", () => {
  it("pads to a 24-hour clock", () => {
    expect(formatZonedTime(9, 5)).toBe("09:05");
    expect(formatZonedTime(0, 0)).toBe("00:00");
  });
});
