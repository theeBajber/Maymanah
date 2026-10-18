import { describe, expect, it } from "vitest";

import { expandWindows, firstFreeWindow, planWeeklySlots, totalOverlapMinutes } from "./pairing";

const at = (iso: string) => new Date(iso).getTime();

describe("expandWindows", () => {
  it("places a window on the date it falls, in the owner's own zone", () => {
    // Sunday 22:00 UTC is already Monday in Nairobi, so the Monday window lands
    // on the 15th and its 09:00 is 06:00 UTC.
    const from = new Date("2026-06-14T22:00:00Z");
    const windows = [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }];
    const intervals = expandWindows(windows, "Africa/Nairobi", from, 3);

    expect(intervals).toHaveLength(1);
    expect(new Date(intervals[0].start).toISOString()).toBe("2026-06-15T06:00:00.000Z");
    expect(new Date(intervals[0].end).toISOString()).toBe("2026-06-15T09:00:00.000Z");
  });

  it("keeps the same wall clock either side of a daylight-saving change", () => {
    const windows = [{ dayOfWeek: 6, startTime: "09:00", endTime: "10:00" }];
    const before = expandWindows(windows, "America/New_York", new Date("2026-03-02T12:00:00Z"), 7);
    const after = expandWindows(windows, "America/New_York", new Date("2026-03-09T12:00:00Z"), 7);

    expect(new Date(before[0].start).toISOString()).toBe("2026-03-07T14:00:00.000Z");
    expect(new Date(after[0].start).toISOString()).toBe("2026-03-14T13:00:00.000Z");
  });

  it("ignores a window that ends before it starts", () => {
    const windows = [{ dayOfWeek: 1, startTime: "12:00", endTime: "09:00" }];
    expect(expandWindows(windows, "UTC", new Date("2026-06-15T00:00:00Z"), 2)).toHaveLength(0);
  });
});

describe("totalOverlapMinutes", () => {
  it("sums the minutes two sets of windows share", () => {
    const a = [{ start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T09:00:00Z") }];
    const b = [{ start: at("2026-06-15T07:00:00Z"), end: at("2026-06-15T10:00:00Z") }];
    expect(totalOverlapMinutes(a, b)).toBe(120);
  });

  it("counts nothing for windows that only touch", () => {
    const a = [{ start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T09:00:00Z") }];
    const b = [{ start: at("2026-06-15T09:00:00Z"), end: at("2026-06-15T10:00:00Z") }];
    expect(totalOverlapMinutes(a, b)).toBe(0);
  });
});

describe("firstFreeWindow", () => {
  const start = at("2026-06-15T06:00:00Z");
  const end = at("2026-06-15T09:00:00Z");
  const quarter = 15 * 60_000;

  it("returns the start when nothing is booked", () => {
    expect(firstFreeWindow([], start, end, quarter)).toBe(start);
  });

  it("steps past a booking that overlaps the earliest slot", () => {
    const occupied = [{ start, end: start + quarter }];
    expect(firstFreeWindow(occupied, start, end, quarter)).toBe(start + quarter);
  });

  it("returns null when the window is fully booked", () => {
    const occupied = [{ start, end }];
    expect(firstFreeWindow(occupied, start, end, quarter)).toBeNull();
  });
});

describe("planWeeklySlots", () => {
  const tz = "Africa/Nairobi";

  it("keeps one daily slot and one review for a shared weekday", () => {
    const monday = [{ start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T09:00:00Z") }];
    const slots = planWeeklySlots(monday, monday, [], tz);

    expect(slots).toEqual([
      { type: "DAILY_HIFDH", dayOfWeek: 1, startTime: "09:00", duration: 15 },
      { type: "MURAJA", dayOfWeek: 1, startTime: "09:15", duration: 60 },
    ]);
  });

  it("places the daily slot after a teacher's existing booking", () => {
    const monday = [{ start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T09:00:00Z") }];
    const occupied = [{ start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T06:15:00Z") }];
    const slots = planWeeklySlots(monday, monday, occupied, tz);
    expect(slots[0]).toMatchObject({ type: "DAILY_HIFDH", startTime: "09:15" });
  });

  it("keeps a single daily slot per weekday however many windows overlap", () => {
    const student = [
      { start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T09:00:00Z") },
      { start: at("2026-06-15T07:00:00Z"), end: at("2026-06-15T08:00:00Z") },
    ];
    const teacher = [{ start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T09:00:00Z") }];
    const daily = planWeeklySlots(student, teacher, [], tz).filter((slot) => slot.type === "DAILY_HIFDH");
    expect(daily).toHaveLength(1);
  });

  it("reads the slot on the teacher's clock, whatever the zone's offset", () => {
    const overlap = [{ start: at("2026-06-15T03:30:00Z"), end: at("2026-06-15T06:00:00Z") }];
    const slots = planWeeklySlots(overlap, overlap, [], "Asia/Kolkata");
    expect(slots[0]).toMatchObject({ type: "DAILY_HIFDH", startTime: "09:00" });
  });

  it("keeps the local time across a daylight-saving change", () => {
    const winter = [{ start: at("2026-03-07T14:00:00Z"), end: at("2026-03-07T16:00:00Z") }];
    const summer = [{ start: at("2026-03-09T13:00:00Z"), end: at("2026-03-09T15:00:00Z") }];
    expect(planWeeklySlots(winter, winter, [], "America/New_York")[0].startTime).toBe("09:00");
    expect(planWeeklySlots(summer, summer, [], "America/New_York")[0].startTime).toBe("09:00");
  });

  it("plans nothing when the two share no window", () => {
    const student = [{ start: at("2026-06-15T06:00:00Z"), end: at("2026-06-15T07:00:00Z") }];
    const teacher = [{ start: at("2026-06-15T08:00:00Z"), end: at("2026-06-15T09:00:00Z") }];
    expect(planWeeklySlots(student, teacher, [], tz)).toEqual([]);
  });
});
