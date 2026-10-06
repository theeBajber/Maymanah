import "server-only";

import { cache } from "react";

import { db } from "./db";

/**
 * The fields every signed-in page needs, read in one query.
 */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  emailVerified: Date | null;
  twoFactorEnabled: boolean;
  image: string | null;
}

interface SessionLike {
  user?: { id?: string };
}

/**
 * Resolves the signed-in user and confirms their session is still active.
 *
 * A session cookie is self-contained, so removing a device record from the
 * database would achieve nothing on its own: the cookie would keep working until
 * it expired on its own. Checking the record on each request is what makes
 * revoking a device actually end that sign-in.
 *
 * Wrapped in `cache` so several components asking for the current user during
 * one request produce a single query rather than one each.
 */
export const getCurrentUser = cache(async (session: SessionLike | null): Promise<CurrentUser | null> => {
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      twoFactorEnabled: true,
      image: true,
    },
  });

  return user ?? null;
});

/**
 * Returns the signed-in user's login session identifier, if any.
 *
 * Absent when the caller passed no session. Used by sign-out to revoke only the
 * device that asked, leaving other devices signed in.
 */
export function currentLoginSessionId(session: SessionLike | null): string | undefined {
  const loginSessionId = (session?.user as { loginSessionId?: string } | undefined)?.loginSessionId;
  return loginSessionId;
}

/** Marks one signed-in device as signed out. */
export async function revokeLoginSession(loginSessionId: string): Promise<void> {
  await db.loginSession.updateMany({
    where: { id: loginSessionId, isActive: true },
    data: { isActive: false },
  });
}

/** Marks every device belonging to a user as signed out. */
export async function revokeAllLoginSessions(userId: string): Promise<void> {
  await db.loginSession.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
}

/**
 * Confirms the session cookie still refers to an active device.
 *
 * Returns false when the cookie is valid but the device has been revoked, which
 * is the case that distinguishes this from ordinary cookie validation.
 */
export const isLoginSessionActive = cache(async (loginSessionId: string | undefined): Promise<boolean> => {
  if (!loginSessionId) return true;

  const record = await db.loginSession.findUnique({
    where: { id: loginSessionId },
    select: { isActive: true },
  });

  return record?.isActive ?? false;
});