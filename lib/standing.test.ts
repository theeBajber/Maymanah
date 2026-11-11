import { describe, expect, it } from "vitest";

import {
  describeAbsences,
  shouldEscalate,
  standingForAbsences,
  standingLabel,
  standingRank,
} from "./standing";

const thresholds = { warn: 2, pause: 3, disable: 5 };

describe("standingForAbsences", () => {
  it("keeps accounts below the first threshold in good standing", () => {
    expect(standingForAbsences(0, thresholds)).toBe("GOOD");
    expect(standingForAbsences(1, thresholds)).toBe("GOOD");
  });

  it("warns at the warn threshold", () => {
    expect(standingForAbsences(2, thresholds)).toBe("WARNED");
  });

  it("pauses at the pause threshold", () => {
    expect(standingForAbsences(3, thresholds)).toBe("PAUSED");
    expect(standingForAbsences(4, thresholds)).toBe("PAUSED");
  });

  it("proposes a disable at the disable threshold and beyond", () => {
    expect(standingForAbsences(5, thresholds)).toBe("DISABLED");
    expect(standingForAbsences(12, thresholds)).toBe("DISABLED");
  });

  it("uses inclusive thresholds", () => {
    const exact = { warn: 1, pause: 1, disable: 1 };
    expect(standingForAbsences(1, exact)).toBe("DISABLED");
    expect(standingForAbsences(0, exact)).toBe("GOOD");
  });
});

describe("standingRank", () => {
  it("orders the rungs from good to disabled", () => {
    expect(standingRank("GOOD")).toBeLessThan(standingRank("WARNED"));
    expect(standingRank("WARNED")).toBeLessThan(standingRank("PAUSED"));
    expect(standingRank("PAUSED")).toBeLessThan(standingRank("DISABLED"));
  });
});

describe("shouldEscalate", () => {
  it("moves up the ladder", () => {
    expect(shouldEscalate("GOOD", "WARNED")).toBe(true);
    expect(shouldEscalate("WARNED", "PAUSED")).toBe(true);
    expect(shouldEscalate("PAUSED", "DISABLED")).toBe(true);
  });

  it("never moves down or repeats", () => {
    expect(shouldEscalate("PAUSED", "PAUSED")).toBe(false);
    expect(shouldEscalate("DISABLED", "PAUSED")).toBe(false);
    expect(shouldEscalate("WARNED", "GOOD")).toBe(false);
  });
});

describe("standingLabel", () => {
  it("names each rung", () => {
    expect(standingLabel("GOOD")).toBe("Good standing");
    expect(standingLabel("WARNED")).toBe("Warning");
    expect(standingLabel("PAUSED")).toBe("Bookings paused");
    expect(standingLabel("DISABLED")).toBe("Disabled");
  });
});

describe("describeAbsences", () => {
  it("agrees with a single session", () => {
    expect(describeAbsences(1, 30)).toBe("1 session was missed in the last 30 days.");
  });

  it("agrees with several sessions", () => {
    expect(describeAbsences(3, 14)).toBe("3 sessions were missed in the last 14 days.");
  });
});
