import { describe, expect, it } from "vitest";

import { updatePreferencesSchema, writePreferences } from "./preferences";
import { defaultProfileView, updateProfileSchema } from "./profile";

describe("updateProfileSchema", () => {
  it("accepts a complete profile", () => {
    const result = updateProfileSchema.safeParse({
      name: "Amina Yusuf",
      bio: "Learning Hifdh",
      phone: "+254700000000",
      country: "Kenya",
      timezone: "Africa/Nairobi",
      quranLevel: "beginner",
      gender: "female",
    });

    expect(result.success).toBe(true);
  });

  it("normalises whitespace the same way every other form does", () => {
    const result = updateProfileSchema.safeParse({ name: "  Amina   Yusuf  " });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Amina Yusuf");
  });

  it("refuses an unknown Quran level rather than storing it", () => {
    expect(updateProfileSchema.safeParse({ quranLevel: "expert" }).success).toBe(false);
  });

  it("refuses anything but male or female for gender", () => {
    expect(updateProfileSchema.safeParse({ gender: "other" }).success).toBe(false);
  });

  it("accepts an empty image as clearing the picture", () => {
    const result = updateProfileSchema.safeParse({ image: "" });

    expect(result.success).toBe(true);
  });

  it("lowercases an address so casing cannot create a second account", () => {
    const result = updateProfileSchema.safeParse({ email: "AMINA@Example.COM" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("amina@example.com");
  });
});

describe("defaultProfileView", () => {
  it("fills every field a new account has not set yet", () => {
    const view = defaultProfileView({ name: "Amina", email: "a@example.com", image: null, gender: null });

    expect(view.bio).toBe("");
    expect(view.timezone).toBe("Africa/Nairobi");
    expect(view.quranLevel).toBe("beginner");
    expect(view.gender).toBe("");
  });
});

describe("updatePreferencesSchema", () => {
  it("accepts valid preferences", () => {
    expect(
      updatePreferencesSchema.safeParse({
        theme: "dark",
        language: "ar",
        quranFont: "uthmani",
        emailNotifications: false,
        studyReminders: true,
        reminderTime: "07:30",
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown theme rather than storing it", () => {
    expect(updatePreferencesSchema.safeParse({ theme: "midnight" }).success).toBe(false);
  });

  it("rejects an impossible clock time, not just a malformed one", () => {
    expect(updatePreferencesSchema.safeParse({ reminderTime: "25:00" }).success).toBe(false);
    expect(updatePreferencesSchema.safeParse({ reminderTime: "09:99" }).success).toBe(false);
    expect(updatePreferencesSchema.safeParse({ reminderTime: "9:00" }).success).toBe(false);
  });

  it("accepts every supported interface language", () => {
    for (const language of ["en", "ar", "fr", "es"]) {
      expect(updatePreferencesSchema.safeParse({ language }).success).toBe(true);
    }
  });
});

describe("writePreferences", () => {
  it("throws without a session instead of writing to nobody", async () => {
    await expect(writePreferences(null, {})).rejects.toThrow();
  });
});
