import { describe, expect, it } from "vitest";

import { minutesToTime, splitIntoSessions, subtractBooked, timeToMinutes, windowsOverlap } from "./scheduling";

describe("timeToMinutes", () => {
  it("converts a morning time", () => {
    expect(timeToMinutes("09:30")).toBe(570);
  });

  it("converts midnight and the last minute of the day", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("rejects impossible times rather than wrapping them", () => {
    expect(timeToMinutes("24:00")).toBeNull();
    expect(timeToMinutes("09:60")).toBeNull();
    expect(timeToMinutes("9:30")).toBeNull();
    expect(timeToMinutes("morning")).toBeNull();
  });
});

describe("minutesToTime", () => {
  it("round-trips through the day", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(570)).toBe("09:30");
    expect(minutesToTime(1439)).toBe("23:59");
  });

  it("clamps out-of-range values instead of producing nonsense", () => {
    expect(minutesToTime(-30)).toBe("00:00");
    expect(minutesToTime(1500)).toBe("23:59");
  });
});

describe("windowsOverlap", () => {
  it("detects a partial overlap", () => {
    expect(windowsOverlap({ startTime: "09:00", endTime: "10:00" }, { startTime: "09:30", endTime: "10:30" })).toBe(true);
  });

  it("detects containment either way", () => {
    expect(windowsOverlap({ startTime: "09:00", endTime: "12:00" }, { startTime: "10:00", endTime: "11:00" })).toBe(true);
    expect(windowsOverlap({ startTime: "10:00", endTime: "11:00" }, { startTime: "09:00", endTime: "12:00" })).toBe(true);
  });

  it("does not count touching endpoints as an overlap, so back-to-back sessions are bookable", () => {
    expect(windowsOverlap({ startTime: "09:00", endTime: "10:00" }, { startTime: "10:00", endTime: "11:00" })).toBe(false);
  });

  it("treats malformed input as overlapping, so a bad time blocks rather than double-books", () => {
    expect(windowsOverlap({ startTime: "nope", endTime: "10:00" }, { startTime: "09:00", endTime: "09:30" })).toBe(true);
  });
});

describe("subtractBooked", () => {
  it("removes the booked middle and keeps both sides", () => {
    expect(
      subtractBooked(
        [{ startTime: "09:00", endTime: "12:00" }],
        [{ startTime: "10:00", endTime: "11:00" }],
      ),
    ).toEqual([
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "11:00", endTime: "12:00" },
    ]);
  });

  it("leaves availability alone when nothing touches it", () => {
    const availability = [{ startTime: "09:00", endTime: "10:00" }];

    expect(subtractBooked(availability, [{ startTime: "14:00", endTime: "15:00" }])).toEqual(availability);
  });

  it("drops availability fully covered by a booking", () => {
    expect(
      subtractBooked(
        [{ startTime: "10:00", endTime: "11:00" }],
        [{ startTime: "09:00", endTime: "12:00" }],
      ),
    ).toEqual([]);
  });

  it("handles several bookings across several windows", () => {
    expect(
      subtractBooked(
        [
          { startTime: "09:00", endTime: "10:00" },
          { startTime: "14:00", endTime: "16:00" },
        ],
        [
          { startTime: "09:30", endTime: "09:45" },
          { startTime: "15:00", endTime: "16:00" },
        ],
      ),
    ).toEqual([
      { startTime: "09:00", endTime: "09:30" },
      { startTime: "09:45", endTime: "10:00" },
      { startTime: "14:00", endTime: "15:00" },
    ]);
  });
});

describe("splitIntoSessions", () => {
  it("splits an hour into two half-hour sessions", () => {
    expect(splitIntoSessions([{ startTime: "09:00", endTime: "10:00" }], 30)).toEqual([
      { startTime: "09:00", endTime: "09:30" },
      { startTime: "09:30", endTime: "10:00" },
    ]);
  });

  it("drops a remainder shorter than a session", () => {
    expect(splitIntoSessions([{ startTime: "09:00", endTime: "09:45" }], 30)).toEqual([
      { startTime: "09:00", endTime: "09:30" },
    ]);
  });

  it("offers nothing when the window is shorter than one session", () => {
    expect(splitIntoSessions([{ startTime: "09:00", endTime: "09:15" }], 30)).toEqual([]);
  });
});
