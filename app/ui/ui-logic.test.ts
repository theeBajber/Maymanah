import { describe, expect, it } from "vitest";

import { buttonClasses } from "@/app/ui/button";
import { defaultAvatar } from "@/lib/avatar";
import { selectedIndex } from "@/app/ui/segmented";

describe("buttonClasses", () => {
  it("combines the base, size, and variant", () => {
    const classes = buttonClasses("primary", "md");

    expect(classes).toContain("inline-flex");
    expect(classes).toContain("h-11");
    expect(classes).toContain("bg-brass");
  });

  it("keeps the ghost and quiet treatments distinct", () => {
    expect(buttonClasses("ghost", "md")).toContain("border");
    expect(buttonClasses("quiet", "md")).toContain("text-lapis");
    expect(buttonClasses("quiet", "md")).not.toContain("bg-brass");
  });

  it("appends extra classes without dropping the base", () => {
    const classes = buttonClasses("primary", "lg", "w-full");

    expect(classes).toContain("w-full");
    expect(classes).toContain("h-12");
  });
});

describe("defaultAvatar", () => {
  it("is deterministic for the same seed", () => {
    expect(defaultAvatar("user-1")).toBe(defaultAvatar("user-1"));
  });

  it("varies across different seeds", () => {
    expect(defaultAvatar("user-1")).not.toBe(defaultAvatar("user-2"));
  });

  it("survives a missing seed without throwing", () => {
    expect(() => defaultAvatar(undefined)).not.toThrow();
    expect(defaultAvatar(undefined)).toBeTruthy();
  });
});

describe("selectedIndex", () => {
  const options = [
    { value: "STUDENT", label: "Learner" },
    { value: "TEACHER", label: "Teacher" },
  ];

  it("finds the matching option", () => {
    expect(selectedIndex(options, "TEACHER")).toBe(1);
  });

  it("falls back to the first position for an unknown value, rather than pointing nowhere", () => {
    expect(selectedIndex(options, "ADMIN")).toBe(0);
  });
});
