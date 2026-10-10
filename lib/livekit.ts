import "server-only";

import { AccessToken } from "livekit-server-sdk";

import { env } from "./env";

/**
 * Mints a token that admits one person to one session room.
 *
 * The identity is the user, not the visit: rejoining with the same identity
 * replaces a stale connection instead of adding a duplicate participant.
 * Credentials are read from the validated environment rather than directly,
 * so a missing key fails with every other missing variable at once instead of
 * surfacing here as a special case.
 */
export async function generateSessionToken({
  userId,
  name,
  roomName,
}: {
  userId: string;
  name: string;
  roomName: string;
}): Promise<string> {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = env();

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error(
      "Video sessions are not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET to enable them.",
    );
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userId,
    name,
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}

/** The room every session meets in, derived from the session itself. */
export function roomNameFor(appointmentId: string): string {
  return `session_${appointmentId}`;
}
