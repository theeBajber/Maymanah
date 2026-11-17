import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import {
  MeetingError,
  meetingSettingsFor,
  setDefaultMeetingUrl,
  setMeetingPreference,
} from "@/lib/meetings";

async function teacher() {
  const user = await getCurrentUser(await auth());
  if (!user) return { error: NextResponse.json({ error: "Sign in to do this" }, { status: 401 }) };
  if (user.role !== "TEACHER") {
    return { error: NextResponse.json({ error: "Only teachers can do this" }, { status: 403 }) };
  }
  return { user };
}

/** A teacher's meeting preference and whether a calendar is connected. */
export async function GET(): Promise<NextResponse> {
  const result = await teacher();
  if (result.error) return result.error;

  return NextResponse.json(await meetingSettingsFor(result.user.id));
}

const patchSchema = z.object({
  preference: z.enum(["AUTO", "MANUAL"]).optional(),
  defaultUrl: z.string().max(2048).optional(),
});

/**
 * Updates how this teacher's lesson rooms are produced.
 *
 * Either field may arrive alone. AUTO is allowed even without a connection:
 * rooms then fall back to the teacher's own link, and the settings page
 * explains what is missing.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  const result = await teacher();
  if (result.error) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the request" }, { status: 422 });
  }

  const { preference, defaultUrl } = parsed.data;
  if (preference === undefined && defaultUrl === undefined) {
    return NextResponse.json({ error: "Nothing to change" }, { status: 422 });
  }

  try {
    if (preference !== undefined) {
      await setMeetingPreference(result.user.id, preference);
    }
    if (defaultUrl !== undefined) {
      await setDefaultMeetingUrl(result.user.id, defaultUrl);
    }
  } catch (error) {
    if (error instanceof MeetingError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }

  return NextResponse.json(await meetingSettingsFor(result.user.id));
}
