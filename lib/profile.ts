import "server-only";

import { z } from "zod";

import { db } from "./db";
import { getCurrentUser, type SessionLike } from "./session";
import { toMultiLine, toSingleLine } from "./text";

const QURAN_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export const updateProfileSchema = z.object({
  name: z.string().transform(toSingleLine).pipe(z.string().min(2).max(80)).optional(),
  email: z.string().transform(toSingleLine).pipe(z.email()).transform((value) => value.toLowerCase()).optional(),
  bio: z.string().transform(toMultiLine).pipe(z.string().max(500)).optional(),
  phone: z.string().transform(toSingleLine).pipe(z.string().max(20)).optional(),
  country: z.string().transform(toSingleLine).pipe(z.string().max(100)).optional(),
  timezone: z.string().transform(toSingleLine).pipe(z.string().max(50)).optional(),
  quranLevel: z.enum(QURAN_LEVELS).optional(),
  image: z.string().max(500).or(z.literal("")).optional(),
  gender: z.enum(["male", "female"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface ProfileView {
  name: string;
  email: string;
  image: string | null;
  gender: string;
  bio: string;
  phone: string;
  country: string;
  timezone: string;
  quranLevel: string;
}

/** Defaults for an account that has never saved a profile. */
export function defaultProfileView(user: { name: string; email: string; image: string | null; gender: string | null }): ProfileView {
  return {
    name: user.name,
    email: user.email,
    image: user.image,
    gender: user.gender ?? "",
    bio: "",
    phone: "",
    country: "",
    timezone: "Africa/Nairobi",
    quranLevel: "beginner",
  };
}

export async function readProfile(session: SessionLike | null): Promise<ProfileView | null> {
  const user = await getCurrentUser(session);
  if (!user) return null;

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return defaultProfileView(user);

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    gender: user.gender ?? "",
    bio: profile.bio ?? "",
    phone: profile.phone ?? "",
    country: profile.country ?? "",
    timezone: profile.timezone,
    quranLevel: profile.quranLevel ?? "beginner",
  };
}

export type ProfileUpdateFailure = "email_taken";

export async function writeProfile(
  session: SessionLike | null,
  input: UpdateProfileInput,
): Promise<{ ok: true } | { ok: false; reason: ProfileUpdateFailure }> {
  const user = await getCurrentUser(session);
  if (!user) throw new Error("writeProfile requires a signed-in user");

  if (input.email && input.email !== user.email) {
    const taken = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
    if (taken) return { ok: false, reason: "email_taken" };
  }

  // Gender drives same-gender teacher matching, so it is set once and then
  // locked. Further attempts are ignored rather than rejected, because the
  // form resubmits the whole profile on every save.
  const full = await db.user.findUnique({ where: { id: user.id }, select: { gender: true } });
  const canSetGender = !full?.gender;

  // A changed address is unverified until confirmed again. Without this,
  // typing someone else's address into the field would mark it as yours.
  const emailChanged = input.email !== undefined && input.email !== user.email;

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.image !== undefined && { image: input.image || null }),
        ...(input.gender !== undefined && canSetGender && { gender: input.gender }),
        ...(emailChanged && { emailVerified: null }),
      },
    });

    await tx.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        bio: input.bio,
        phone: input.phone,
        country: input.country,
        timezone: input.timezone,
        quranLevel: input.quranLevel,
      },
      update: {
        ...(input.bio !== undefined && { bio: input.bio || null }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.country !== undefined && { country: input.country || null }),
        ...(input.timezone !== undefined && { timezone: input.timezone }),
        ...(input.quranLevel !== undefined && { quranLevel: input.quranLevel }),
      },
    });
  });

  return { ok: true };
}