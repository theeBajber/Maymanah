import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";

import type { MeetingConnectionStatus, MeetingPreference, MeetingProvider } from "@prisma/client";

import { db } from "./db";
import { env } from "./env";

/**
 * Lesson rooms.
 *
 * This is the only module that knows how a room is produced. It supports two
 * providers behind one call: a link the teacher pasted, and a room created in
 * the teacher's own calendar. Callers receive `{ joinUrl, provider }` and never
 * need to know which one answered.
 *
 * The raw address is returned to the join route only. Summaries, lists, email,
 * and notifications deliberately have no access to it.
 */

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const AUTHORISATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const CALENDAR_ENDPOINT = "https://www.googleapis.com/calendar/v3";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.app.created";
const CALENDAR_NAME = "Maymanah Lessons";
const MEET_HOST = "meet.google.com";
const IV_BYTES = 12;
const KEY_BYTES = 32;

export type MeetingFailure =
  | "not_configured"
  | "reauth"
  | "no_link"
  | "invalid_link"
  | "provider_error";

/** A failure a route can turn into a clear message without leaking internals. */
export class MeetingError extends Error {
  readonly code: MeetingFailure;

  constructor(code: MeetingFailure, message: string) {
    super(message);
    this.name = "MeetingError";
    this.code = code;
  }
}

/**
 * Accepts only a Google Meet address on the exact host.
 *
 * Teachers paste these from different places, so whitespace is trimmed and the
 * address is rebuilt from its parsed parts. Credentials, ports, query strings,
 * and fragments are refused rather than silently kept, since a "meeting link"
 * carrying extra parameters is not something this app should hand to a student.
 */
export function normalizeMeetUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (url.hostname !== MEET_HOST) return null;
  if (url.username || url.password || url.port) return null;
  if (url.search || url.hash) return null;
  if (!/^\/[A-Za-z0-9][A-Za-z0-9-]*$/.test(url.pathname)) return null;

  return `https://${MEET_HOST}${url.pathname}`;
}

function meetingKey(key?: Buffer): Buffer {
  if (key) return key;

  const encoded = env().MEETING_TOKEN_KEY;
  if (!encoded) {
    throw new MeetingError(
      "not_configured",
      "Calendar connections are not configured on this deployment.",
    );
  }

  const decoded = Buffer.from(encoded, "base64");
  if (decoded.length !== KEY_BYTES) {
    throw new MeetingError(
      "not_configured",
      "MEETING_TOKEN_KEY must be a base64-encoded 32-byte key.",
    );
  }
  return decoded;
}

/**
 * Encrypts a refresh token for storage.
 *
 * AES-256-GCM is authenticated, so a corrupted or tampered row fails to decrypt
 * rather than yielding a credential. The version prefix leaves room to rotate
 * the format without guessing how an existing value was written.
 */
export function encryptSecret(value: string, key?: Buffer): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", meetingKey(key), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptSecret(payload: string, key?: Buffer): string {
  const [version, ivPart, tagPart, dataPart] = payload.split(".");
  if (version !== "v1" || !ivPart || !tagPart || !dataPart) {
    throw new Error("Unreadable stored meeting credential");
  }

  const decipher = createDecipheriv("aes-256-gcm", meetingKey(key), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Whether this deployment can offer a calendar connection at all. */
export function meetingConfigured(): boolean {
  const config = env();
  return Boolean(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.MEETING_TOKEN_KEY);
}

function appOrigin(): string {
  return env().APP_URL.replace(/\/$/, "");
}

export function meetingRedirectUri(): string {
  return `${appOrigin()}/api/meetings/google/callback`;
}

/** Where a teacher is sent to grant calendar access. */
export function meetingAuthorisationUrl(state: string): string {
  const config = env();
  if (!meetingConfigured() || !config.GOOGLE_CLIENT_ID) {
    throw new MeetingError("not_configured", "Calendar connections are not configured.");
  }

  const url = new URL(AUTHORISATION_ENDPOINT);
  url.searchParams.set("client_id", config.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", meetingRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", CALENDAR_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return url.toString();
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

async function requestTokens(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const payload = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok) {
    throw new MeetingError(
      "provider_error",
      payload.error_description ?? "The calendar provider refused the request.",
    );
  }
  return payload;
}

async function accessTokenFromRefreshToken(refreshToken: string): Promise<string> {
  const config = env();
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    throw new MeetingError("not_configured", "Calendar connections are not configured.");
  }

  let tokens: TokenResponse;
  try {
    tokens = await requestTokens(
      new URLSearchParams({
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    );
  } catch (error) {
    // A refused refresh means the grant is gone; a network failure might not
    // be. Only the former should ask the teacher to reconnect.
    if (error instanceof MeetingError) {
      throw new MeetingError("reauth", "The calendar connection needs to be renewed.");
    }
    throw error;
  }

  if (!tokens.access_token) {
    throw new MeetingError("reauth", "The calendar connection needs to be renewed.");
  }
  return tokens.access_token;
}

interface GoogleCalendar {
  id?: string;
  summary?: string;
}

async function createCalendar(accessToken: string): Promise<GoogleCalendar> {
  const response = await fetch(`${CALENDAR_ENDPOINT}/calendars`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ summary: CALENDAR_NAME, timeZone: "UTC" }),
  });

  const payload = (await response.json().catch(() => ({}))) as GoogleCalendar & {
    error?: { message?: string };
  };

  if (!response.ok || !payload.id) {
    throw new MeetingError(
      "provider_error",
      payload.error?.message ?? "The lessons calendar could not be created.",
    );
  }
  return payload;
}

interface CalendarEvent {
  id?: string;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
  error?: { message?: string };
}

interface LessonForMeeting {
  id: string;
  title: string | null;
  startTime: Date;
  endTime: Date | null;
  teacherId: string;
  /** The teacher's fallback link, if they set one. */
  meetingUrl: string | null;
  /** A room already created in the calendar, if any. */
  generatedMeetingUrl: string | null;
  meetingEventId: string | null;
}

export interface LessonRoom {
  joinUrl: string;
  provider: MeetingProvider;
}

async function createMeetEvent(
  accessToken: string,
  calendarId: string,
  lesson: LessonForMeeting,
): Promise<{ meetUrl: string; eventId: string }> {
  const end = lesson.endTime ?? new Date(lesson.startTime.getTime() + 60 * 60_000);

  const response = await fetch(
    `${CALENDAR_ENDPOINT}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=none`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        summary: lesson.title ?? "Maymanah lesson",
        description: "Lesson on Maymanah",
        start: { dateTime: lesson.startTime.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as CalendarEvent;
  if (!response.ok || !payload.id) {
    if (response.status === 401 || response.status === 403) {
      throw new MeetingError("reauth", "The calendar connection needs to be renewed.");
    }
    throw new MeetingError(
      "provider_error",
      payload.error?.message ?? "The lesson room could not be created.",
    );
  }

  const meetUrl = payload.conferenceData?.entryPoints?.find(
    (entry) => entry.entryPointType === "video",
  )?.uri;

  const normalized = meetUrl ? normalizeMeetUrl(meetUrl) : null;
  if (!normalized) {
    throw new MeetingError("provider_error", "The provider did not return a usable meeting link.");
  }

  return { meetUrl: normalized, eventId: payload.id };
}

/** Marks a stored connection unusable so the teacher is asked to reconnect. */
async function markConnectionExpired(userId: string, message: string): Promise<void> {
  await db.meetingAccount.updateMany({
    where: { userId },
    data: { status: "REAUTH_REQUIRED", lastError: message },
  });
}

/** Exchanges the one-time code and stores the resulting connection. */
export async function connectMeetingAccount(userId: string, code: string): Promise<void> {
  const config = env();
  if (!meetingConfigured() || !config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    throw new MeetingError("not_configured", "Calendar connections are not configured.");
  }

  const tokens = await requestTokens(
    new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: meetingRedirectUri(),
    }),
  );

  if (!tokens.refresh_token || !tokens.access_token) {
    throw new MeetingError(
      "provider_error",
      "Calendar access was not granted. Try again and allow the requested permission.",
    );
  }

  const calendar = await createCalendar(tokens.access_token);

  await db.meetingAccount.upsert({
    where: { userId },
    create: {
      userId,
      refreshToken: encryptSecret(tokens.refresh_token),
      calendarId: calendar.id!,
      calendarName: calendar.summary ?? CALENDAR_NAME,
    },
    update: {
      refreshToken: encryptSecret(tokens.refresh_token),
      calendarId: calendar.id!,
      calendarName: calendar.summary ?? CALENDAR_NAME,
      status: "CONNECTED",
      lastError: null,
    },
  });
}

export interface MeetingSettings {
  configured: boolean;
  preference: MeetingPreference;
  connected: boolean;
  status: MeetingConnectionStatus | null;
  calendarName: string | null;
  /**
   * The teacher's standing room address, or null when none is set. It is the
   * teacher's own link, so settings may echo it; the join route is still the
   * only place that hands it to a student.
   */
  defaultUrl: string | null;
}

export async function meetingSettingsFor(userId: string): Promise<MeetingSettings> {
  const [profile, account] = await Promise.all([
    db.ustadhProfile.findUnique({
      where: { userId },
      select: { meetingPreference: true, defaultMeetingUrl: true },
    }),
    db.meetingAccount.findUnique({
      where: { userId },
      select: { status: true, calendarName: true },
    }),
  ]);

  return {
    configured: meetingConfigured(),
    preference: profile?.meetingPreference ?? "MANUAL",
    connected: account?.status === "CONNECTED",
    status: account?.status ?? null,
    calendarName: account?.calendarName ?? null,
    defaultUrl: profile?.defaultMeetingUrl ?? null,
  };
}

/**
 * Stores the teacher's standing room address.
 *
 * Only a real Google Meet address is accepted, matching what a session link
 * will accept at join time. An empty value clears the field.
 */
export async function setDefaultMeetingUrl(userId: string, url: string): Promise<string | null> {
  const normalized = normalizeMeetUrl(url);

  if (url.trim() !== "" && !normalized) {
    throw new MeetingError("invalid_link", "Use a Google Meet link, e.g. https://meet.google.com/abc-defg-hij.");
  }

  await db.ustadhProfile.upsert({
    where: { userId },
    create: { userId, defaultMeetingUrl: normalized },
    update: { defaultMeetingUrl: normalized },
  });

  return normalized;
}

export async function setMeetingPreference(
  userId: string,
  preference: MeetingPreference,
): Promise<void> {
  await db.ustadhProfile.upsert({
    where: { userId },
    create: { userId, meetingPreference: preference },
    update: { meetingPreference: preference },
  });
}

/**
 * Forgets a calendar connection.
 *
 * Generated rooms belong to that connection, so the stored links are cleared
 * as well. A teacher's own link is left alone and keeps upcoming lessons
 * joinable.
 */
export async function disconnectMeetingAccount(userId: string): Promise<void> {
  await db.$transaction([
    db.meetingAccount.deleteMany({ where: { userId } }),
    db.appointment.updateMany({
      where: { teacherId: userId, meetingEventId: { not: null } },
      data: {
        generatedMeetingUrl: null,
        meetingProvider: null,
        meetingEventId: null,
        meetingCreatedAt: null,
      },
    }),
  ]);
}

/**
 * Produces the room for one lesson.
 *
 * In MANUAL mode the teacher's link is the answer. In AUTO mode a room in the
 * teacher's calendar is reused if one already exists for the lesson, and
 * created otherwise. Any failure falls back to the teacher's own link, so a
 * lapsed connection never stops a lesson; only when there is no fallback does
 * the caller get an error.
 */
export async function createLessonRoom(lesson: LessonForMeeting): Promise<LessonRoom> {
  const profile = await db.ustadhProfile.findUnique({
    where: { userId: lesson.teacherId },
    select: { meetingPreference: true, defaultMeetingUrl: true },
  });
  const preference = profile?.meetingPreference ?? "MANUAL";

  // The session's own link wins; the teacher's standing room is the floor, so
  // a lesson nobody pasted a link into is still joinable.
  const fallbackSource = lesson.meetingUrl ?? profile?.defaultMeetingUrl ?? null;
  const manual = fallbackSource ? normalizeMeetUrl(fallbackSource) : null;

  if (preference === "MANUAL") {
    if (!manual) {
      throw new MeetingError("no_link", "This lesson has no meeting link yet.");
    }
    return { joinUrl: manual, provider: "MANUAL" };
  }

  const account = await db.meetingAccount.findUnique({
    where: { userId: lesson.teacherId },
  });

  if (!account || account.status !== "CONNECTED") {
    if (manual) return { joinUrl: manual, provider: "MANUAL" };
    throw new MeetingError(
      account ? "reauth" : "not_configured",
      account
        ? "The calendar connection needs to be renewed."
        : "No meeting room is available for this lesson yet.",
    );
  }

  const existing = lesson.generatedMeetingUrl ? normalizeMeetUrl(lesson.generatedMeetingUrl) : null;
  if (existing && lesson.meetingEventId) {
    return { joinUrl: existing, provider: "GOOGLE_MEET" };
  }

  try {
    return await db.$transaction(async (tx) => {
      // Both sides may open the page at once; the lock makes one of them create
      // the room and the other reuse it, rather than producing two events.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`meeting:${lesson.id}`}, 0))`;

      const fresh = await tx.appointment.findUnique({
        where: { id: lesson.id },
        select: { generatedMeetingUrl: true, meetingEventId: true },
      });
      const alreadyCreated = fresh?.generatedMeetingUrl
        ? normalizeMeetUrl(fresh.generatedMeetingUrl)
        : null;
      if (alreadyCreated && fresh?.meetingEventId) {
        return { joinUrl: alreadyCreated, provider: "GOOGLE_MEET" as const };
      }

      let created: { meetUrl: string; eventId: string };
      try {
        const accessToken = await accessTokenFromRefreshToken(decryptSecret(account.refreshToken));
        created = await createMeetEvent(accessToken, account.calendarId, lesson);
      } catch (error) {
        if (error instanceof MeetingError && error.code === "reauth") {
          await markConnectionExpired(account.userId, error.message);
        }
        throw error;
      }

      await tx.appointment.update({
        where: { id: lesson.id },
        data: {
          generatedMeetingUrl: created.meetUrl,
          meetingEventId: created.eventId,
          meetingProvider: "GOOGLE_MEET",
          meetingCreatedAt: new Date(),
        },
      });

      return { joinUrl: created.meetUrl, provider: "GOOGLE_MEET" as const };
    });
  } catch (error) {
    if (manual) return { joinUrl: manual, provider: "MANUAL" };
    if (error instanceof MeetingError) throw error;
    throw new MeetingError("provider_error", "The lesson room could not be created.");
  }
}

/** Stores a teacher's own link for one lesson. */
export async function setManualMeetingLink(
  appointmentId: string,
  teacherId: string,
  rawUrl: string,
): Promise<void> {
  const url = normalizeMeetUrl(rawUrl);
  if (!url) {
    throw new MeetingError(
      "invalid_link",
      "Paste a Google Meet link like https://meet.google.com/abc-defg-hij",
    );
  }

  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, teacherId },
    select: { id: true },
  });
  if (!appointment) {
    throw new MeetingError("no_link", "That session could not be found.");
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: {
      meetingUrl: url,
      meetingProvider: "MANUAL",
      generatedMeetingUrl: null,
      meetingEventId: null,
      meetingCreatedAt: null,
    },
  });
}

/** Removes a teacher's own link from one lesson. */
export async function clearManualMeetingLink(
  appointmentId: string,
  teacherId: string,
): Promise<void> {
  await db.appointment.updateMany({
    where: { id: appointmentId, teacherId },
    data: {
      meetingUrl: null,
      meetingProvider: null,
      generatedMeetingUrl: null,
      meetingEventId: null,
      meetingCreatedAt: null,
    },
  });
}

/**
 * Drops the generated room for a lesson that moved.
 *
 * A Meet event is tied to its time, so a rescheduled lesson gets a fresh room
 * on the next join. The teacher's own link is kept.
 */
export async function forgetGeneratedMeeting(appointmentId: string): Promise<void> {
  await db.appointment.updateMany({
    where: { id: appointmentId, meetingEventId: { not: null } },
    data: {
      generatedMeetingUrl: null,
      meetingProvider: null,
      meetingEventId: null,
      meetingCreatedAt: null,
    },
  });
}
