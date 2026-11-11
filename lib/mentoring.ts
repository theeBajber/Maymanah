import "server-only";

import type { MentorshipStatus, Prisma } from "@prisma/client";

import { db } from "./db";
import { env } from "./env";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether a pairing is holding one of its teacher's seats.
 *
 * A reservation holds a seat while the student chooses a timetable; an active
 * pairing holds it for as long as it runs. A paused pairing keeps the seat for
 * a grace period, so a student who steps away briefly is not sent to the back
 * of the queue. Anything else — completed, expired — has given the seat back.
 */
export function seatIsHeld(
  status: MentorshipStatus,
  pausedAt: Date | null,
  now: Date,
  pausedSeatDays: number,
): boolean {
  if (status === "RESERVED" || status === "ACTIVE") return true;
  if (status !== "PAUSED") return false;

  // A pause without a start time predates the column. Treat it as holding the
  // seat rather than silently releasing it on the first evaluation.
  if (!pausedAt) return true;

  return pausedAt.getTime() + pausedSeatDays * DAY_MS > now.getTime();
}

/** How many of a teacher's seats are still free, never below zero. */
export function remainingSeats(maxStudents: number, used: number): number {
  return Math.max(0, maxStudents - used);
}

/** Whether a reserved seat has waited past its deadline. */
export function reservationHasLapsed(reservedUntil: Date | null, now: Date): boolean {
  return reservedUntil !== null && reservedUntil.getTime() <= now.getTime();
}

/** Whether a paused seat has been idle past the grace period. */
export function pausedSeatHasLapsed(pausedAt: Date | null, now: Date, pausedSeatDays: number): boolean {
  if (!pausedAt) return false;
  return pausedAt.getTime() + pausedSeatDays * DAY_MS <= now.getTime();
}

/** The statuses and pause window that consume capacity for one teacher. */
export function seatHoldingWhere(now: Date, pausedSeatDays: number): Prisma.MentorshipWhereInput {
  const pausedCutoff = new Date(now.getTime() - pausedSeatDays * DAY_MS);

  return {
    OR: [
      { status: { in: ["RESERVED", "ACTIVE"] } },
      { status: "PAUSED", OR: [{ pausedAt: null }, { pausedAt: { gte: pausedCutoff } }] },
    ],
  };
}

export interface MentorCandidate {
  teacherId: string;
  name: string;
  maxStudents: number;
  used: number;
  remaining: number;
}

/**
 * The same-gender teachers who can still take a student, least loaded first.
 *
 * Gender is a hard filter, not a preference: pairing is same-gender by policy,
 * so a teacher of another gender is not a candidate even when they are free.
 */
export async function availableMentors(gender: string | null, now = new Date()): Promise<MentorCandidate[]> {
  if (!gender) return [];

  const pausedSeatDays = env().MENTOR_PAUSED_SEAT_DAYS;

  const teachers = await db.user.findMany({
    where: {
      role: "TEACHER",
      gender,
      ustadhProfile: { isApproved: true, availableForTeaching: true },
    },
    select: {
      id: true,
      name: true,
      ustadhProfile: { select: { maxStudents: true } },
    },
  });

  if (teachers.length === 0) return [];

  const counts = await db.mentorship.groupBy({
    by: ["teacherId"],
    where: {
      teacherId: { in: teachers.map((teacher) => teacher.id) },
      ...seatHoldingWhere(now, pausedSeatDays),
    },
    _count: { _all: true },
  });
  const usedByTeacher = new Map(counts.map((row) => [row.teacherId, row._count._all]));

  return teachers
    .map((teacher) => {
      const maxStudents = teacher.ustadhProfile?.maxStudents ?? 4;
      const used = usedByTeacher.get(teacher.id) ?? 0;
      return {
        teacherId: teacher.id,
        name: teacher.name,
        maxStudents,
        used,
        remaining: remainingSeats(maxStudents, used),
      };
    })
    .filter((teacher) => teacher.remaining > 0)
    .sort((a, b) => a.used - b.used || a.name.localeCompare(b.name));
}

/** The total free seats across every eligible teacher of one gender. */
export async function availableSeats(gender: string | null, now = new Date()): Promise<number> {
  const mentors = await availableMentors(gender, now);
  return mentors.reduce((total, mentor) => total + mentor.remaining, 0);
}

/** How many seats one teacher is currently holding, including reservations. */
export async function usedSeats(teacherId: string, now = new Date()): Promise<number> {
  return db.mentorship.count({
    where: { teacherId, ...seatHoldingWhere(now, env().MENTOR_PAUSED_SEAT_DAYS) },
  });
}

export type ReserveMentorFailure = "no_student" | "not_student" | "gender_missing" | "full";

export type ReserveMentorResult =
  | { ok: true; mentorshipId: string; teacherId: string; created: boolean }
  | { ok: false; reason: ReserveMentorFailure };

/**
 * Claims one seat for a student, creating a RESERVED pairing.
 *
 * The seat is counted and written inside a transaction that holds advisory
 * locks for the student and the teacher, so two students enrolling at the same
 * moment cannot both see the last free place, and one student cannot claim two
 * teachers. Callers get the existing held seat if there is one, which makes
 * enrolment idempotent.
 */
export async function reserveMentor(
  studentId: string,
  options: { now?: Date } = {},
): Promise<ReserveMentorResult> {
  const now = options.now ?? new Date();
  const pausedSeatDays = env().MENTOR_PAUSED_SEAT_DAYS;

  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { id: true, role: true, gender: true },
  });
  if (!student) return { ok: false, reason: "no_student" };
  if (student.role !== "STUDENT") return { ok: false, reason: "not_student" };
  if (!student.gender) return { ok: false, reason: "gender_missing" };

  const held = await db.mentorship.findFirst({
    where: { studentId, ...seatHoldingWhere(now, pausedSeatDays) },
    select: { id: true, teacherId: true },
  });
  if (held) {
    return { ok: true, mentorshipId: held.id, teacherId: held.teacherId, created: false };
  }

  const candidates = await availableMentors(student.gender, now);
  for (const candidate of candidates) {
    const claimed = await claimSeat(studentId, candidate.teacherId, student.gender, now);
    if (claimed) return { ok: true, ...claimed };
  }

  return { ok: false, reason: "full" };
}

async function claimSeat(
  studentId: string,
  teacherId: string,
  studentGender: string,
  now: Date,
): Promise<{ mentorshipId: string; teacherId: string; created: boolean } | null> {
  const pausedSeatDays = env().MENTOR_PAUSED_SEAT_DAYS;
  const reservationDays = env().MENTOR_RESERVATION_DAYS;
  const reservedUntil = new Date(now.getTime() + reservationDays * DAY_MS);

  return db.$transaction(async (tx) => {
    // Locks are taken in a fixed order — student, then teacher — so two
    // enrolments that cross paths wait rather than deadlock. The student lock
    // also stops one student claiming two teachers in the same instant.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${studentId}, 0))`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${teacherId}, 0))`;

    const alreadyHeld = await tx.mentorship.findFirst({
      where: { studentId, ...seatHoldingWhere(now, pausedSeatDays) },
      select: { id: true, teacherId: true },
    });
    if (alreadyHeld) {
      return { mentorshipId: alreadyHeld.id, teacherId: alreadyHeld.teacherId, created: false };
    }

    const teacher = await tx.user.findUnique({
      where: { id: teacherId },
      select: {
        gender: true,
        ustadhProfile: { select: { isApproved: true, availableForTeaching: true, maxStudents: true } },
      },
    });

    if (!teacher || teacher.gender !== studentGender) return null;
    const profile = teacher.ustadhProfile;
    if (!profile?.isApproved || !profile.availableForTeaching) return null;

    const used = await tx.mentorship.count({
      where: { teacherId, ...seatHoldingWhere(now, pausedSeatDays) },
    });
    if (used >= profile.maxStudents) return null;

    const existing = await tx.mentorship.findUnique({
      where: { teacherId_studentId: { teacherId, studentId } },
      select: { id: true },
    });

    const row = existing
      ? await tx.mentorship.update({
          where: { id: existing.id },
          data: {
            status: "RESERVED",
            reservedUntil,
            pausedAt: null,
            endedAt: null,
            endReason: null,
          },
          select: { id: true },
        })
      : await tx.mentorship.create({
          data: { teacherId, studentId, status: "RESERVED", reservedUntil },
          select: { id: true },
        });

    return { mentorshipId: row.id, teacherId, created: !existing };
  });
}

/** Gives a seat back and removes the sessions that belonged to it. */
export async function releaseSeat(mentorshipId: string, reason: string): Promise<boolean> {
  const now = new Date();

  const released = await db.$transaction(async (tx) => {
    const updated = await tx.mentorship.updateMany({
      where: { id: mentorshipId, status: { notIn: ["EXPIRED", "COMPLETED"] } },
      data: {
        status: "EXPIRED",
        reservedUntil: null,
        pausedAt: null,
        endedAt: now,
        endReason: reason,
      },
    });
    if (updated.count === 0) return false;

    await tx.recurringSlot.deleteMany({ where: { mentorshipId } });
    await tx.appointment.deleteMany({
      where: { mentorshipId, status: "SCHEDULED", startTime: { gte: now } },
    });

    return true;
  });

  return released;
}

/** Releases every seat a student still holds, used when they leave a course. */
export async function releaseStudentSeats(studentId: string, reason: string): Promise<number> {
  const seats = await db.mentorship.findMany({
    where: {
      studentId,
      status: { in: ["RESERVED", "ACTIVE", "PAUSED"] },
    },
    select: { id: true },
  });

  for (const seat of seats) {
    await releaseSeat(seat.id, reason);
  }

  return seats.length;
}

/** The seat a student currently holds, if any. */
export async function heldSeat(studentId: string, now = new Date()): Promise<{ id: string; teacherId: string } | null> {
  return db.mentorship.findFirst({
    where: { studentId, ...seatHoldingWhere(now, env().MENTOR_PAUSED_SEAT_DAYS) },
    select: { id: true, teacherId: true },
  });
}

/**
 * Promotes a reservation once a timetable exists.
 *
 * Called inside the allocator's transaction: the slots and the status change
 * commit together, so a pairing is never ACTIVE without a schedule.
 */
export async function activateMentorship(tx: Prisma.TransactionClient, mentorshipId: string): Promise<void> {
  await tx.mentorship.update({
    where: { id: mentorshipId },
    data: {
      status: "ACTIVE",
      reservedUntil: null,
      pausedAt: null,
      endedAt: null,
      endReason: null,
    },
  });
}

export interface ReleasedSeat {
  mentorshipId: string;
  teacherId: string;
  studentId: string;
}

/** Reservations whose deadline passed without a timetable. */
export async function expireStaleReservations(now = new Date()): Promise<ReleasedSeat[]> {
  const rows = await db.mentorship.findMany({
    where: { status: "RESERVED", reservedUntil: { lte: now } },
    select: { id: true, teacherId: true, studentId: true },
  });
  if (rows.length === 0) return [];

  await db.mentorship.updateMany({
    where: { id: { in: rows.map((row) => row.id) } },
    data: {
      status: "EXPIRED",
      reservedUntil: null,
      endedAt: now,
      endReason: "reservation_expired",
    },
  });

  return rows.map((row) => ({
    mentorshipId: row.id,
    teacherId: row.teacherId,
    studentId: row.studentId,
  }));
}

/** Paused pairings that have been idle past the grace period. */
export async function releaseStalePausedSeats(now = new Date()): Promise<ReleasedSeat[]> {
  const pausedSeatDays = env().MENTOR_PAUSED_SEAT_DAYS;
  const cutoff = new Date(now.getTime() - pausedSeatDays * DAY_MS);

  const rows = await db.mentorship.findMany({
    where: { status: "PAUSED", pausedAt: { not: null, lte: cutoff } },
    select: { id: true, teacherId: true, studentId: true },
  });
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);

  await db.$transaction([
    db.mentorship.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "EXPIRED",
        endedAt: now,
        endReason: "paused_seat_expired",
      },
    }),
    db.recurringSlot.deleteMany({ where: { mentorshipId: { in: ids } } }),
    db.appointment.deleteMany({
      where: { mentorshipId: { in: ids }, status: "SCHEDULED", startTime: { gte: now } },
    }),
  ]);

  return rows.map((row) => ({
    mentorshipId: row.id,
    teacherId: row.teacherId,
    studentId: row.studentId,
  }));
}
