import { describe, expect, it } from "vitest";

import {
  pausedSeatHasLapsed,
  remainingSeats,
  reservationHasLapsed,
  seatHoldingWhere,
  seatIsHeld,
} from "./mentoring";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-11T12:00:00Z");

describe("seatIsHeld", () => {
  it("counts a reservation and an active pairing", () => {
    expect(seatIsHeld("RESERVED", null, now, 30)).toBe(true);
    expect(seatIsHeld("ACTIVE", null, now, 30)).toBe(true);
  });

  it("counts a pause only while it is inside the grace period", () => {
    const inside = new Date(now.getTime() - 29 * DAY_MS);
    const outside = new Date(now.getTime() - 31 * DAY_MS);

    expect(seatIsHeld("PAUSED", inside, now, 30)).toBe(true);
    expect(seatIsHeld("PAUSED", outside, now, 30)).toBe(false);
  });

  it("keeps a pause that predates the timestamp rather than releasing it", () => {
    expect(seatIsHeld("PAUSED", null, now, 30)).toBe(true);
  });

  it("does not count a completed or expired pairing", () => {
    expect(seatIsHeld("COMPLETED", null, now, 30)).toBe(false);
    expect(seatIsHeld("EXPIRED", null, now, 30)).toBe(false);
  });
});

describe("remainingSeats", () => {
  it("subtracts the used seats", () => {
    expect(remainingSeats(4, 1)).toBe(3);
    expect(remainingSeats(4, 4)).toBe(0);
  });

  it("never reports a negative number", () => {
    expect(remainingSeats(4, 7)).toBe(0);
  });
});

describe("reservationHasLapsed", () => {
  it("treats a missing deadline as still held", () => {
    expect(reservationHasLapsed(null, now)).toBe(false);
  });

  it("lapses at the deadline, not only after it", () => {
    expect(reservationHasLapsed(now, now)).toBe(true);
    expect(reservationHasLapsed(new Date(now.getTime() + 1), now)).toBe(false);
  });
});

describe("pausedSeatHasLapsed", () => {
  it("never lapses a pause with no start time", () => {
    expect(pausedSeatHasLapsed(null, now, 30)).toBe(false);
  });

  it("lapses once the grace period is used up", () => {
    const exactly30 = new Date(now.getTime() - 30 * DAY_MS);
    const almost30 = new Date(now.getTime() - 30 * DAY_MS + 1);

    expect(pausedSeatHasLapsed(exactly30, now, 30)).toBe(true);
    expect(pausedSeatHasLapsed(almost30, now, 30)).toBe(false);
  });
});

describe("seatHoldingWhere", () => {
  it("includes live pairings and pauses inside the cutoff", () => {
    const where = seatHoldingWhere(now, 30);

    expect(where.OR).toEqual([
      { status: { in: ["RESERVED", "ACTIVE"] } },
      {
        status: "PAUSED",
        OR: [{ pausedAt: null }, { pausedAt: { gte: new Date(now.getTime() - 30 * DAY_MS) } }],
      },
    ]);
  });
});
