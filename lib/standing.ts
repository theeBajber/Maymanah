import "server-only";

import type { AccountStanding } from "@prisma/client";

import { db } from "./db";
import { env } from "./env";
import { baseUrl, sendEmail, standingEmailContent, type StandingEmailLevel } from "./mailer";
import { createNotification } from "./notifications";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Where an account sits on the shared attendance ladder. */
export type Standing = AccountStanding;

/** Rungs in order, used to compare two standings. */
export const STANDING_ORDER: Record<Standing, number> = {
  GOOD: 0,
  WARNED: 1,
  PAUSED: 2,
  DISABLED: 3,
};

export interface StandingThresholds {
  warn: number;
  pause: number;
  disable: number;
}

export function standingRank(standing: Standing): number {
  return STANDING_ORDER[standing];
}

/**
 * The rung a number of no-shows belongs on.
 *
 * Thresholds are inclusive, and the most serious matching rung wins. A count
 * below every threshold is good standing — the ladder never moves an account
 * down on its own, so recovery stays a human decision.
 */
export function standingForAbsences(absences: number, thresholds: StandingThresholds): Standing {
  if (absences >= thresholds.disable) return "DISABLED";
  if (absences >= thresholds.pause) return "PAUSED";
  if (absences >= thresholds.warn) return "WARNED";
  return "GOOD";
}

export function shouldEscalate(current: Standing, desired: Standing): boolean {
  return standingRank(desired) > standingRank(current);
}

export function standingLabel(standing: Standing): string {
  switch (standing) {
    case "WARNED":
      return "Warning";
    case "PAUSED":
      return "Bookings paused";
    case "DISABLED":
      return "Disabled";
    default:
      return "Good standing";
  }
}

/** What one account's attendance window looks like. */
export interface AbsenceSummary {
  absences: number;
  lastAbsenceAt: Date | null;
}

/**
 * Counts sessions the person was expected at but did not attend.
 *
 * A session counts once it has ended, the person has no join record for it,
 * and it was not called off in advance. A report marked EXCUSED removes the
 * session for both sides, so an agreed absence never reaches the ladder.
 *
 * The rule differs slightly by role because the report describes the student:
 * a submitted report is evidence the teacher engaged with the lesson, while a
 * student who was marked present or late is confirmed to have attended.
 */
export async function absenceSummary(
  userId: string,
  since: Date,
  options: { now?: Date; role: "STUDENT" | "TEACHER" },
): Promise<AbsenceSummary> {
  const now = options.now ?? new Date();

  const appointments = await db.appointment.findMany({
    where: {
      startTime: { gte: since, lt: now },
      OR: [{ teacherId: userId }, { mentorship: { studentId: userId } }],
    },
    select: {
      startTime: true,
      endTime: true,
      status: true,
      missed: true,
      report: { select: { attendance: true } },
      joins: { where: { userId }, select: { id: true }, take: 1 },
    },
  });

  let absences = 0;
  let lastAbsenceAt: Date | null = null;

  for (const appointment of appointments) {
    const end = appointment.endTime ?? new Date(appointment.startTime.getTime() + 60 * 60_000);
    if (end >= now) continue;
    if (appointment.status === "CANCELLED" && !appointment.missed) continue;

    const attendance = appointment.report?.attendance;
    if (options.role === "TEACHER") {
      // Submitting the report is itself evidence the teacher was engaged with
      // the session, even when the student was absent.
      if (appointment.report) continue;
    } else if (attendance === "PRESENT" || attendance === "LATE" || attendance === "EXCUSED") {
      continue;
    }

    if (appointment.joins.length > 0) continue;

    absences += 1;
    if (!lastAbsenceAt || appointment.startTime > lastAbsenceAt) {
      lastAbsenceAt = appointment.startTime;
    }
  }

  return { absences, lastAbsenceAt };
}

export interface StandingDecision {
  standing: Standing;
  previous: Standing;
  absences: number;
  lastAbsenceAt: Date | null;
  reason: string;
}

/** The account fields a decision needs, so evaluation does not query twice. */
export interface StandingSubject {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER";
  standing: Standing;
  emailNotifications: boolean;
}

export function describeAbsences(absences: number, windowDays: number): string {
  const sessions = absences === 1 ? "session was" : "sessions were";
  return `${absences} ${sessions} missed in the last ${windowDays} days.`;
}

/**
 * Works out whether an account has earned a new rung.
 *
 * Returns null when nothing has changed, when the rung was already proposed
 * inside the same window, or when the account is already higher on the ladder.
 * Re-proposing the same rung each hour would fill the queue with duplicates
 * without telling anyone anything new.
 */
export async function evaluateStanding(
  subject: StandingSubject,
  now: Date = new Date(),
): Promise<StandingDecision | null> {
  const config = env();
  const windowDays = config.STANDING_WINDOW_DAYS;
  const since = new Date(now.getTime() - windowDays * DAY_MS);

  const summary = await absenceSummary(subject.id, since, { now, role: subject.role });
  const desired = standingForAbsences(summary.absences, {
    warn: config.STANDING_WARN_THRESHOLD,
    pause: config.STANDING_PAUSE_THRESHOLD,
    disable: config.STANDING_DISABLE_THRESHOLD,
  });

  if (!shouldEscalate(subject.standing, desired)) return null;

  // Ignore observations from the other mode: a shadow row must not stop a real
  // warning once shadow mode is switched off, and a live row must not hide the
  // rung a shadow run would have recorded.
  const shadow = env().STANDING_SHADOW_MODE;
  const latest = await db.accountStandingEvent.findFirst({
    where: {
      userId: subject.id,
      createdAt: { gte: since },
      ...(shadow ? { mode: "shadow" } : { mode: { not: "shadow" } }),
    },
    orderBy: { createdAt: "desc" },
    select: { standing: true },
  });
  if (latest?.standing === desired) return null;

  return {
    standing: desired,
    previous: subject.standing,
    absences: summary.absences,
    lastAbsenceAt: summary.lastAbsenceAt,
    reason: describeAbsences(summary.absences, windowDays),
  };
}

/**
 * Records a decision and moves the account onto the new rung.
 *
 * A notice is sent after the write, so the account never reads as changed in
 * one place and unchanged in another. The notification always lands; the email
 * respects the account's preference and never blocks the change.
 */
export async function applyStandingDecision(
  subject: StandingSubject,
  decision: StandingDecision,
  options: { decidedById?: string } = {},
): Promise<void> {
  const now = new Date();

  await db.$transaction([
    db.user.update({
      where: { id: subject.id },
      data: {
        standing: decision.standing,
        standingReason: decision.reason,
        standingUpdatedAt: now,
      },
    }),
    db.accountStandingEvent.create({
      data: {
        userId: subject.id,
        standing: decision.standing,
        previousStanding: decision.previous,
        reason: decision.reason,
        absenceCount: decision.absences,
        applied: true,
        mode: options.decidedById ? "admin" : "automatic",
        decidedAt: now,
        decidedById: options.decidedById ?? null,
      },
    }),
  ]);

  await notifyStanding(subject, decision.standing, decision.reason);
}

async function notifyStanding(
  subject: StandingSubject,
  standing: Standing,
  reason: string,
): Promise<void> {
  if (standing === "GOOD") return;

  const title =
    standing === "WARNED"
      ? "A note about your recent sessions"
      : standing === "PAUSED"
        ? "New bookings are paused on your account"
        : "Your account has been disabled";

  await createNotification({
    userId: subject.id,
    type: "account_standing",
    title,
    body: `${reason} Open your account status for details.`,
    metadata: { link: "/account/status", standing },
  });

  if (!subject.emailNotifications) return;

  await sendEmail({
    to: subject.email,
    ...standingEmailContent(subject.name, standing as StandingEmailLevel, reason, `${baseUrl()}/account/status`),
  });
}

export interface StandingSweepResult {
  reviewed: number;
  shadowed: number;
  applied: number;
  queued: number;
}

/**
 * Evaluates every student and teacher against the ladder.
 *
 * In shadow mode nothing is applied: each decision is written down with
 * `applied: false` so the thresholds can be inspected against real attendance
 * before the first cohort is affected. A disable is always queued for an
 * administrator rather than applied by the sweep itself.
 */
export async function runStandingSweep(now: Date = new Date()): Promise<StandingSweepResult> {
  const shadow = env().STANDING_SHADOW_MODE;

  const users = await db.user.findMany({
    where: { role: { in: ["STUDENT", "TEACHER"] }, standing: { not: "DISABLED" } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      standing: true,
      profile: { select: { emailNotifications: true } },
    },
  });

  const result: StandingSweepResult = { reviewed: 0, shadowed: 0, applied: 0, queued: 0 };

  for (const user of users) {
    const subject: StandingSubject = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "STUDENT" | "TEACHER",
      standing: user.standing,
      emailNotifications: user.profile?.emailNotifications !== false,
    };

    const decision = await evaluateStanding(subject, now);
    if (!decision) continue;
    result.reviewed += 1;

    if (shadow) {
      await db.accountStandingEvent.create({
        data: {
          userId: subject.id,
          standing: decision.standing,
          previousStanding: decision.previous,
          reason: decision.reason,
          absenceCount: decision.absences,
          applied: false,
          mode: "shadow",
        },
      });
      console.info(
        `[standing] shadow: ${subject.email} would move ${decision.previous} -> ${decision.standing} (${decision.reason})`,
      );
      result.shadowed += 1;
      continue;
    }

    if (decision.standing === "DISABLED") {
      const pending = await db.accountStandingEvent.findFirst({
        where: { userId: subject.id, standing: "DISABLED", applied: false, decidedAt: null },
        select: { id: true },
      });
      if (pending) continue;

      await db.accountStandingEvent.create({
        data: {
          userId: subject.id,
          standing: decision.standing,
          previousStanding: decision.previous,
          reason: decision.reason,
          absenceCount: decision.absences,
          applied: false,
          mode: "automatic",
        },
      });
      result.queued += 1;
      continue;
    }

    await applyStandingDecision(subject, decision);
    result.applied += 1;
  }

  return result;
}

/** Disables waiting for an administrator to confirm or dismiss them. */
export async function pendingStandingEvents() {
  return db.accountStandingEvent.findMany({
    where: { standing: "DISABLED", applied: false, decidedAt: null, mode: "automatic" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      createdAt: true,
      reason: true,
      absenceCount: true,
      previousStanding: true,
      user: { select: { id: true, name: true, email: true, role: true, standing: true } },
    },
  });
}

export type StandingDecisionResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "decided" };

/**
 * Applies or dismisses a proposed disable.
 *
 * Only an automatic DISABLED proposal can be decided, and only once: a second
 * click finds the event already dated and does nothing.
 */
export async function decideStanding(
  eventId: string,
  adminId: string,
  action: "confirm" | "dismiss",
): Promise<StandingDecisionResult> {
  const event = await db.accountStandingEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      userId: true,
      standing: true,
      previousStanding: true,
      reason: true,
      absenceCount: true,
      applied: true,
      decidedAt: true,
      mode: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          standing: true,
          profile: { select: { emailNotifications: true } },
        },
      },
    },
  });

  if (!event || event.standing !== "DISABLED" || event.mode !== "automatic") {
    return { ok: false, reason: "missing" };
  }
  if (event.applied || event.decidedAt) return { ok: false, reason: "decided" };

  const now = new Date();

  if (action === "dismiss") {
    await db.accountStandingEvent.update({
      where: { id: eventId },
      data: { decidedAt: now, decidedById: adminId },
    });
    return { ok: true };
  }

  await db.$transaction([
    db.user.update({
      where: { id: event.userId },
      data: {
        standing: "DISABLED",
        standingReason: event.reason,
        standingUpdatedAt: now,
      },
    }),
    db.accountStandingEvent.update({
      where: { id: eventId },
      data: {
        applied: true,
        mode: "admin",
        decidedAt: now,
        decidedById: adminId,
      },
    }),
  ]);

  await notifyStanding(
    {
      id: event.user.id,
      name: event.user.name,
      email: event.user.email,
      role: event.user.role as "STUDENT" | "TEACHER",
      standing: event.user.standing,
      emailNotifications: event.user.profile?.emailNotifications !== false,
    },
    "DISABLED",
    event.reason,
  );

  return { ok: true };
}
