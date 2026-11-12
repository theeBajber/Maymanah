import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createLessonRoom, MeetingError } from "@/lib/meetings";
import { getCurrentUser } from "@/lib/session";

/** A session is joinable from fifteen minutes before it starts. */
const JOIN_EARLY_MS = 15 * 60 * 1000;

/** ...until an hour after it was meant to end, for sessions that run over. */
const JOIN_LATE_MS = 60 * 60 * 1000;

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

/**
 * Opens a session's room.
 *
 * The address is produced here and nowhere else: summaries, lists, and email
 * only ever link back into the app. A join is recorded before the provider is
 * asked for a room, so a failed connection still leaves an honest timestamp.
 *
 * A teacher who has neither connected a calendar nor pasted a link is told so
 * directly; a student in the same situation is told the room is not ready,
 * without exposing the teacher's setup.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  if (user.standing === "DISABLED") {
    return NextResponse.json(
      { error: "Your account is disabled and cannot join sessions." },
      { status: 403 },
    );
  }

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
      meetingUrl: true,
      generatedMeetingUrl: true,
      meetingEventId: true,
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

  const isTeacher = appointment.teacherId === user.id;

  // The click is recorded independently of the provider result, so a student
  // whose room never opened still has an honest join timestamp.
  try {
    await db.lessonJoin.create({ data: { appointmentId: id, userId: user.id } });
  } catch (error) {
    console.error("Could not record lesson join", error);
  }

  let room: { joinUrl: string; provider: "MANUAL" | "GOOGLE_MEET" };
  try {
    room = await createLessonRoom({
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      teacherId: appointment.teacherId,
      meetingUrl: appointment.meetingUrl,
      generatedMeetingUrl: appointment.generatedMeetingUrl,
      meetingEventId: appointment.meetingEventId,
    });
  } catch (error) {
    const code = error instanceof MeetingError ? error.code : "provider_error";
    console.error("Could not open lesson room", code, error);

    if (code === "reauth") {
      return NextResponse.json(
        {
          error: isTeacher
            ? "Your calendar connection needs to be renewed. Reconnect it in settings, or add a meeting link to this lesson."
            : "The meeting room is temporarily unavailable. Your teacher has been asked to reconnect.",
        },
        { status: 503 },
      );
    }
    if (code === "not_configured" || code === "no_link") {
      return NextResponse.json(
        {
          error: isTeacher
            ? "Add a meeting link or connect your calendar before opening this lesson."
            : "Your teacher has not set up the meeting room yet.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "That meeting room could not be opened. Try again in a moment." },
      { status: 502 },
    );
  }

  await db.appointment.update({
    where: { id },
    data: {
      joinedAt: appointment.joinedAt ?? new Date(),
      status: "ONGOING",
    },
  });

  return NextResponse.json({
    joinUrl: room.joinUrl,
    provider: room.provider,
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
