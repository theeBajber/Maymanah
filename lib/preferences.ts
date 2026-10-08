import "server-only";

import { z } from "zod";

import { db } from "./db";
import { getCurrentUser, type SessionLike } from "./session";
import { toSingleLine } from "./text";

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["en", "ar", "fr", "es"]).optional(),
  quranFont: z.string().transform(toSingleLine).pipe(z.string().max(50)).optional(),
  emailNotifications: z.boolean().optional(),
  studyReminders: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Reminder time must be in HH:MM format")
    .optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export interface PreferencesView {
  theme: string;
  language: string;
  quranFont: string;
  emailNotifications: boolean;
  studyReminders: boolean;
  reminderTime: string;
}

const DEFAULTS: PreferencesView = {
  theme: "system",
  language: "en",
  quranFont: "default",
  emailNotifications: true,
  studyReminders: true,
  reminderTime: "09:00",
};

export async function readPreferences(session: SessionLike | null): Promise<PreferencesView | null> {
  const user = await getCurrentUser(session);
  if (!user) return null;

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: {
      theme: true,
      language: true,
      quranFont: true,
      emailNotifications: true,
      studyReminders: true,
      reminderTime: true,
    },
  });

  return { ...DEFAULTS, ...profile };
}

export async function writePreferences(session: SessionLike | null, input: UpdatePreferencesInput): Promise<void> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("writePreferences requires a signed-in user");

  await db.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...input },
    update: { ...input },
  });
}