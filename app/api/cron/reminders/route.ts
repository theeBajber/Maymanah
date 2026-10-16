import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { mailer } from "@/lib/mailer";
import { createNotification } from "@/lib/notifications";

export const maxDuration = 60;

/**
 * Reminds both sides of sessions starting within the hour, and marks
 * sessions whose time passed without a join as missed.
 *
 * Guarded by a shared secret, since anyone able to call this could spam
 * every user with reminders. Without the secret configured the endpoint
 * refuses rather than running open.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Reminders are not configured" }, { status: 503 });
  }

  const provided =
    request.headers.get("authorization")?.replace(/^Bearer /, "") ??
    new URL(request.url).searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  // Sessions whose time passed without anyone joining are missed, not
  // pending: leaving them scheduled would keep them bookable forever.
  const missed = await db.appointment.updateMany({
    where: { status: "SCHEDULED", endTime: { lt: now } },
    data: { status: "CANCELLED", missed: true },
  });

  const upcoming = await db.appointment.findMany({
    where: { status: "SCHEDULED", startTime: { gte: now, lte: inOneHour }, joinedAt: null },
    select: {
      id: true,
      title: true,
      startTime: true,
      teacher: { select: { id: true, email: true, name: true, profile: { select: { emailNotifications: true } } } },
      mentorship: {
        select: { student: { select: { id: true, email: true, name: true, profile: { select: { emailNotifications: true } } } } },
      },
    },
  });

  let remindersSent = 0;

  for (const appointment of upcoming) {
    const when = appointment.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const title = appointment.title ?? "Session";

    await createNotification({
      userId: appointment.teacher.id,
      type: "session_reminder",
      title: `${title} starts at ${when}`,
      metadata: { appointmentId: appointment.id },
    });
    await createNotification({
      userId: appointment.mentorship.student.id,
      type: "session_reminder",
      title: `${title} starts at ${when}`,
      metadata: { appointmentId: appointment.id },
    });

    for (const person of [appointment.teacher, appointment.mentorship.student]) {
      if (person.profile?.emailNotifications === false) continue;
      try {
        await mailer.send({
          to: person.email,
          subject: `Reminder: ${title} at ${when}`,
          text: `Assalamu alaikum ${person.name},\n\nThis is a reminder that ${title} starts at ${when}.\n\nOpen your sessions list to join on time.`,
        });
      } catch (error) {
        console.error("Could not send session reminder", error);
      }
    }

    remindersSent += 1;
  }

  return NextResponse.json({ ok: true, missedMarked: missed.count, remindersSent });
}
