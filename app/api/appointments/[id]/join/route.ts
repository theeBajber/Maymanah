import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateSessionToken, roomNameFor } from "@/lib/livekit";
import { getCurrentUser } from "@/lib/session";

/** A session is joinable from fifteen minutes before it starts. */
const JOIN_EARLY_MS = 15 * 60 * 1000;

/** ...until an hour after it was meant to end, for sessions that run over. */
const JOIN_LATE_MS = 60 * 60 * 1000;

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Admits a participant to a session's video room.
 *
 * Joining is allowed inside a window around the session, not only while it
 * runs, so an early teacher can prepare and a late session can finish. The
 * first join marks the session ongoing; rejoining only refreshes the join
 * time, since ending and restarting the session on every reconnect would
 * corrupt its record.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const { id } = await params;

  const appointment = await db.appointment.findFirst({
    where: { id, OR: [{ mentorship: { studentId: user.id } }, { teacherId: user.id }] },
    select: {
      id: true,
      title: true,
      status: true,
      startTime: true,
      endTime: true,
      joinedAt: true,
      teacherId: true,
      mentorship: { select: { studentId: true } },
      sessionPlan: true,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }

  if (appointment.status === "CANCELLED") {
    return NextResponse.json({ error: "That session was cancelled" }, { status: 410 });
  }
  if (appointment.status === "COMPLETED") {
    return NextResponse.json({ error: "That session has ended" }, { status: 410 });
  }

  const now = Date.now();
  const end = appointment.endTime?.getTime() ?? appointment.startTime.getTime() + JOIN_LATE_MS;

  if (now < appointment.startTime.getTime() - JOIN_EARLY_MS) {
    return NextResponse.json({ error: "That session has not started yet" }, { status: 425 });
  }
  if (now > end + JOIN_LATE_MS) {
    return NextResponse.json({ error: "That session has ended" }, { status: 410 });
  }

  let liveKitUrl: string | undefined;
  try {
    liveKitUrl = env().LIVEKIT_URL;
  } catch {
    liveKitUrl = undefined;
  }

  if (!liveKitUrl || !liveKitUrl.startsWith("wss://")) {
    return NextResponse.json(
      { error: "Video sessions are not configured yet" },
      { status: 503 },
    );
  }

  const isTeacher = appointment.teacherId === user.id;
  const roomName = roomNameFor(appointment.id);

  let token: string;
  try {
    token = await generateSessionToken({ userId: user.id, name: user.name, roomName });
  } catch {
    return NextResponse.json({ error: "Video sessions are not configured yet" }, { status: 503 });
  }

  await db.appointment.update({
    where: { id },
    data: {
      joinedAt: appointment.joinedAt ?? new Date(),
      status: "ONGOING",
    },
  });

  return NextResponse.json({
    token,
    roomName,
    liveKitUrl,
    otherUserId: isTeacher ? appointment.mentorship.studentId : appointment.teacherId,
    appointment: {
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.startTime,
      status: "ONGOING",
      isTeacher,
    },
    plan: appointment.sessionPlan,
  });
}