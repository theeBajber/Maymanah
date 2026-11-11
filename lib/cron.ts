import "server-only";

import { db } from "./db";
import { baseUrl, sendEmail, sessionReminderEmailContent } from "./mailer";
import { expireStaleReservations, releaseStalePausedSeats } from "./mentoring";
import { createNotification } from "./notifications";
import { runStandingSweep, type StandingSweepResult } from "./standing";

/** Why a cron request was refused, or that it may run. */
export type CronAuthorisation = "ok" | "unconfigured" | "unauthorized";

/**
 * Confirms an hourly job call carries the shared secret.
 *
 * A missing secret refuses rather than running open: the endpoints send email
 * to every user, so an unauthenticated call would be a spam amplifier. Both
 * the bearer header and a query parameter are accepted, since schedulers vary
 * in what they can set.
 */
export function authoriseCron(request: Request): CronAuthorisation {
  const secret = process.env.CRON_SECRET;
  if (!secret) return "unconfigured";

  const provided =
    request.headers.get("authorization")?.replace(/^Bearer /, "") ??
    new URL(request.url).searchParams.get("secret");

  return provided === secret ? "ok" : "unauthorized";
}

export interface HourlyResult {
  missedMarked: number;
  remindersSent: number;
  seatsReleased: number;
  standing: StandingSweepResult;
}

/**
 * Runs everything that should happen once an hour.
 *
 * Order matters only in one direction: seats and missed sessions are settled
 * before attendance is judged, so a sweep never sees a session that has ended
 * but has not yet been marked. Every step is idempotent, which lets the job be
 * retried after a partial failure.
 */
export async function runHourlyJobs(now: Date = new Date()): Promise<HourlyResult> {
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  // Seats that were never claimed by a timetable, or were left paused for too
  // long, are given back here.
  const [expiredReservations, releasedPaused] = await Promise.all([
    expireStaleReservations(now),
    releaseStalePausedSeats(now),
  ]);
  const releasedSeats = [
    ...expiredReservations.map((seat) => ({ ...seat, reason: "reservation" as const })),
    ...releasedPaused.map((seat) => ({ ...seat, reason: "paused" as const })),
  ];

  for (const seat of releasedSeats) {
    const student = await db.user.findUnique({
      where: { id: seat.studentId },
      select: { id: true, email: true, name: true, profile: { select: { emailNotifications: true } } },
    });
    if (!student) continue;

    const title =
      seat.reason === "reservation"
        ? "Your reserved teaching place has expired"
        : "Your teaching place has been released";
    const body =
      seat.reason === "reservation"
        ? "You enrolled but did not choose a timetable in time, so your reserved place has been given to another student. You can enrol again when a place opens."
        : "Your pairing was paused for longer than the grace period, so your teaching place has been released. Your course progress is kept, and you can re-enrol when a place opens.";

    await createNotification({
      userId: student.id,
      type: "mentorship_released",
      title,
      body,
      metadata: { mentorshipId: seat.mentorshipId, link: "/courses" },
    });

    if (student.profile?.emailNotifications === false) continue;
    await sendEmail({
      to: student.email,
      subject: title,
      text: `Assalamu alaikum ${student.name},\n\n${body}\n\nYour courses: ${baseUrl()}/courses`,
    });
  }

  // Sessions whose time passed without anyone joining are missed, not pending:
  // leaving them scheduled would keep them bookable forever.
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
    const sessionLink = `${baseUrl()}/session/${appointment.id}`;

    await createNotification({
      userId: appointment.teacher.id,
      type: "session_reminder",
      title: `${title} starts at ${when}`,
      body: "Open the session to join.",
      metadata: { appointmentId: appointment.id, link: `/session/${appointment.id}` },
    });
    await createNotification({
      userId: appointment.mentorship.student.id,
      type: "session_reminder",
      title: `${title} starts at ${when}`,
      body: "Open the session to join.",
      metadata: { appointmentId: appointment.id, link: `/session/${appointment.id}` },
    });

    for (const person of [appointment.teacher, appointment.mentorship.student]) {
      if (person.profile?.emailNotifications === false) continue;
      await sendEmail({
        to: person.email,
        ...sessionReminderEmailContent(person.name, title, when, sessionLink),
      });
    }

    remindersSent += 1;
  }

  const standing = await runStandingSweep(now);

  return {
    missedMarked: missed.count,
    remindersSent,
    seatsReleased: releasedSeats.length,
    standing,
  };
}
