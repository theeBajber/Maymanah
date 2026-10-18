import "server-only";

import { db } from "./db";
import { formatZonedTime, zonedParts, weekdayOfDate, zonedTimeToUtc } from "./timezone";

/** A daily memorisation slot is short; a review is an hour. */
const DAILY_DURATION = 15;
const MURAJA_DURATION = 60;

/** A teacher takes at most this many students before being passed over. */
const MAX_STUDENTS_PER_TEACHER = 10;

/** How many days ahead a pairing is planned, and appointments materialised. */
const HORIZON_DAYS = 7;

/** Windows are offered in quarter-hours, which is the finest the grid offers. */
const SLOT_STEP_MS = 15 * 60_000;

const DAILY_MS = DAILY_DURATION * 60_000;
const MURAJA_MS = MURAJA_DURATION * 60_000;

export interface AvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Interval {
  start: number;
  end: number;
}

export type SlotType = "DAILY_HIFDH" | "MURAJA";

export interface PlannedSlot {
  type: SlotType;
  dayOfWeek: number;
  startTime: string;
  duration: number;
}

export interface ScheduleSlot {
  type: SlotType;
  dayOfWeek: number;
  startTime: string;
  duration: number;
}

export interface StudentSchedule {
  mentorshipId: string;
  teacherId: string;
  teacherName: string;
  teacherTimeZone: string;
  slots: ScheduleSlot[];
}

function addDays(
  year: number,
  month: number,
  day: number,
  offset: number,
): { year: number; month: number; day: number } {
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + offset);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function parseTime(time: string): [number, number] | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return [hours, minutes];
}

function endOfWindow(startTime: string, duration: number): string | null {
  const start = parseTime(startTime);
  if (!start) return null;
  const total = start[0] * 60 + start[1] + duration;
  if (total >= 24 * 60) return null;
  return formatZonedTime(Math.floor(total / 60), total % 60);
}

/**
 * Places weekly windows on the calendar, as instants.
 *
 * Each window is resolved against the date it actually falls on, so a slot in a
 * zone that observes daylight saving shifts with the clock rather than drifting
 * by an hour. Windows are read on the owner's own clock: a Monday 09:00 window
 * means Monday 09:00 where they live.
 */
export function expandWindows(
  windows: AvailabilityWindow[],
  timeZone: string,
  from: Date,
  days: number,
): Interval[] {
  const origin = zonedParts(from, timeZone);
  const intervals: Interval[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = addDays(origin.year, origin.month, origin.day, offset);
    const dayOfWeek = weekdayOfDate(date.year, date.month, date.day);

    for (const window of windows) {
      if (window.dayOfWeek !== dayOfWeek) continue;
      const start = parseTime(window.startTime);
      const end = parseTime(window.endTime);
      if (!start || !end) continue;

      const startAt = zonedTimeToUtc(date.year, date.month, date.day, start[0], start[1], timeZone).getTime();
      const endAt = zonedTimeToUtc(date.year, date.month, date.day, end[0], end[1], timeZone).getTime();
      if (endAt > startAt) intervals.push({ start: startAt, end: endAt });
    }
  }

  return intervals;
}

/** Minutes shared by two sets of windows, used to rank one teacher above another. */
export function totalOverlapMinutes(a: Interval[], b: Interval[]): number {
  let total = 0;
  for (const left of a) {
    for (const right of b) {
      total += Math.max(0, Math.min(left.end, right.end) - Math.max(left.start, right.start));
    }
  }
  return total / 60_000;
}

/**
 * The first free quarter-hour that fits entirely within a window.
 *
 * Scans from the window's start, so the earliest shared time is taken and a
 * later student cannot be pushed out of a slot that was open when they looked.
 */
export function firstFreeWindow(
  occupied: Interval[],
  start: number,
  end: number,
  duration: number,
  step: number = SLOT_STEP_MS,
): number | null {
  for (let cursor = start; cursor + duration <= end; cursor += step) {
    const clashes = occupied.some((block) => cursor < block.end && cursor + duration > block.start);
    if (!clashes) return cursor;
  }
  return null;
}

function wallTimeAt(instant: number, timeZone: string): { dayOfWeek: number; hour: number; minute: number } {
  const parts = zonedParts(new Date(instant), timeZone);
  return { dayOfWeek: weekdayOfDate(parts.year, parts.month, parts.day), hour: parts.hour, minute: parts.minute };
}

/**
 * Chooses the weekly slots a pairing runs on.
 *
 * Works from concrete instants rather than an abstract weekly grid: the student
 * and teacher windows have already been placed on real dates, so an overlap is
 * genuine rather than a coincidence of two offsets. One daily slot is kept per
 * weekday the two share, and one hour-long review per week, each placed in a
 * free quarter-hour that does not collide with the teacher's other students.
 */
export function planWeeklySlots(
  studentIntervals: Interval[],
  teacherIntervals: Interval[],
  occupied: Interval[],
  teacherTimeZone: string,
): PlannedSlot[] {
  const overlaps: Interval[] = [];
  for (const student of studentIntervals) {
    for (const teacher of teacherIntervals) {
      const start = Math.max(student.start, teacher.start);
      const end = Math.min(student.end, teacher.end);
      if (end - start >= DAILY_MS) overlaps.push({ start, end });
    }
  }
  overlaps.sort((a, b) => a.start - b.start);

  const planned: PlannedSlot[] = [];
  const taken = [...occupied];
  const dailyDays = new Set<number>();

  for (const overlap of overlaps) {
    const local = wallTimeAt(overlap.start, teacherTimeZone);
    if (dailyDays.has(local.dayOfWeek)) continue;

    const free = firstFreeWindow(taken, overlap.start, overlap.end, DAILY_MS);
    if (free === null) continue;

    const placed = wallTimeAt(free, teacherTimeZone);
    if (placed.hour * 60 + placed.minute + DAILY_DURATION > 24 * 60) continue;

    dailyDays.add(placed.dayOfWeek);
    taken.push({ start: free, end: free + DAILY_MS });
    planned.push({
      type: "DAILY_HIFDH",
      dayOfWeek: placed.dayOfWeek,
      startTime: formatZonedTime(placed.hour, placed.minute),
      duration: DAILY_DURATION,
    });
  }

  for (const overlap of overlaps) {
    const free = firstFreeWindow(taken, overlap.start, overlap.end, MURAJA_MS);
    if (free === null) continue;

    const placed = wallTimeAt(free, teacherTimeZone);
    if (placed.hour * 60 + placed.minute + MURAJA_DURATION > 24 * 60) continue;

    taken.push({ start: free, end: free + MURAJA_MS });
    planned.push({
      type: "MURAJA",
      dayOfWeek: placed.dayOfWeek,
      startTime: formatZonedTime(placed.hour, placed.minute),
      duration: MURAJA_DURATION,
    });
    break;
  }

  return planned;
}

async function timeZoneFor(userId: string): Promise<string> {
  const profile = await db.profile.findUnique({ where: { userId }, select: { timezone: true } });
  return profile?.timezone ?? "Africa/Nairobi";
}

async function availabilityFor(userId: string): Promise<AvailabilityWindow[]> {
  return db.availability.findMany({
    where: { userId, isRecurring: true },
    select: { dayOfWeek: true, startTime: true, endTime: true },
  });
}

function slotsToWindows(slots: { dayOfWeek: number; startTime: string; duration: number }[]): AvailabilityWindow[] {
  return slots.flatMap((slot) => {
    const endTime = endOfWindow(slot.startTime, slot.duration);
    return endTime ? [{ dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime }] : [];
  });
}

/** The active Hifdh pairing a student already runs, if one exists. */
export async function getStudentSchedule(studentId: string): Promise<StudentSchedule | null> {
  const mentorship = await db.mentorship.findFirst({
    where: { studentId, status: "ACTIVE" },
    select: {
      id: true,
      teacherId: true,
      teacher: { select: { name: true } },
      recurringSlots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });
  if (!mentorship) return null;

  return {
    mentorshipId: mentorship.id,
    teacherId: mentorship.teacherId,
    teacherName: mentorship.teacher.name,
    teacherTimeZone: await timeZoneFor(mentorship.teacherId),
    slots: mentorship.recurringSlots.map((slot) => ({
      type: slot.type as SlotType,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      duration: slot.duration,
    })),
  };
}

/** The slot a student's daily session runs on today, if the pairing has one. */
export async function getTodayHifdhSlot(
  studentId: string,
): Promise<{ startTime: Date; endTime: Date; duration: number } | null> {
  const mentorship = await db.mentorship.findFirst({
    where: { studentId, status: "ACTIVE" },
    select: { id: true, teacherId: true },
  });
  if (!mentorship) return null;

  const slot = await db.recurringSlot.findFirst({
    where: { mentorshipId: mentorship.id, type: "DAILY_HIFDH" },
  });
  if (!slot) return null;

  const timeZone = await timeZoneFor(mentorship.teacherId);
  const today = zonedParts(new Date(), timeZone);
  if (slot.dayOfWeek !== weekdayOfDate(today.year, today.month, today.day)) return null;

  const [hour, minute] = parseTime(slot.startTime) ?? [0, 0];
  const startTime = zonedTimeToUtc(today.year, today.month, today.day, hour, minute, timeZone);
  const endTime = new Date(startTime.getTime() + slot.duration * 60_000);
  return { startTime, endTime, duration: slot.duration };
}

interface Candidate {
  teacherId: string;
  teacherTimeZone: string;
  overlap: number;
  studentCount: number;
  intervals: Interval[];
}

/**
 * Matches a student with the best available teacher and writes the weekly slots.
 *
 * Candidates are ranked by how many students a teacher already carries, then by
 * how many hours the two share, so the least-loaded suitable teacher is chosen
 * and the busiest hour of overlap is kept. Allocation runs inside a transaction
 * that holds a lock per teacher, so two students matched at the same moment
 * cannot both claim the same free window.
 */
export async function pairHifdhStudent(studentId: string): Promise<StudentSchedule | null> {
  const existing = await db.mentorship.findFirst({
    where: { studentId, status: "ACTIVE" },
    select: { id: true, teacherId: true, _count: { select: { recurringSlots: true } } },
  });
  if (existing && existing._count.recurringSlots > 0) {
    return getStudentSchedule(studentId);
  }

  const student = await db.user.findUnique({ where: { id: studentId }, select: { gender: true } });
  if (!student) return null;

  const now = new Date();
  const studentTimeZone = await timeZoneFor(studentId);
  const studentIntervals = expandWindows(await availabilityFor(studentId), studentTimeZone, now, HORIZON_DAYS);
  if (studentIntervals.length === 0) return null;

  let teacherId: string;
  let teacherTimeZone: string;
  let teacherIntervals: Interval[];

  if (existing) {
    // The student already has a pairing without slots; keep its teacher rather
    // than matching a second one, so nobody is ever paired twice.
    const teacher = await db.user.findUnique({
      where: { id: existing.teacherId },
      select: { id: true, name: true },
    });
    if (!teacher) return null;
    teacherId = teacher.id;
    teacherTimeZone = await timeZoneFor(teacher.id);
    teacherIntervals = expandWindows(await availabilityFor(teacher.id), teacherTimeZone, now, HORIZON_DAYS);
  } else {
    const teachers = await db.user.findMany({
      where: {
        role: "TEACHER",
        gender: student.gender,
        ustadhProfile: { isApproved: true, availableForTeaching: true },
      },
      select: { id: true, name: true },
    });
    if (teachers.length === 0) return null;

    const counts = await db.mentorship.groupBy({
      by: ["teacherId"],
      where: { teacherId: { in: teachers.map((teacher) => teacher.id) }, status: "ACTIVE" },
      _count: { _all: true },
    });
    const countByTeacher = new Map(counts.map((row) => [row.teacherId, row._count._all]));

    const candidates: Candidate[] = [];
    for (const teacher of teachers) {
      const studentCount = countByTeacher.get(teacher.id) ?? 0;
      if (studentCount >= MAX_STUDENTS_PER_TEACHER) continue;

      const zone = await timeZoneFor(teacher.id);
      const intervals = expandWindows(await availabilityFor(teacher.id), zone, now, HORIZON_DAYS);
      const overlap = totalOverlapMinutes(studentIntervals, intervals);
      if (overlap < DAILY_DURATION) continue;

      candidates.push({
        teacherId: teacher.id,
        teacherTimeZone: zone,
        overlap,
        studentCount,
        intervals,
      });
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.studentCount - b.studentCount || b.overlap - a.overlap);
    const best = candidates[0];
    teacherId = best.teacherId;
    teacherTimeZone = best.teacherTimeZone;
    teacherIntervals = best.intervals;
  }

  const mentorshipId = await allocate(studentId, existing?.id ?? null, teacherId, teacherTimeZone, studentIntervals, teacherIntervals);
  if (!mentorshipId) return null;

  await generateUpcomingAppointments(mentorshipId);

  return getStudentSchedule(studentId);
}

async function allocate(
  studentId: string,
  mentorshipId: string | null,
  teacherId: string,
  teacherTimeZone: string,
  studentIntervals: Interval[],
  teacherIntervals: Interval[],
): Promise<string | null> {
  const now = new Date();

  return db.$transaction(async (tx) => {
    // Two students matched to the same teacher at once would otherwise read the
    // same free window before either had written it.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${teacherId}, 0))`;

    const existingSlots = await tx.recurringSlot.findMany({
      where: { type: "DAILY_HIFDH", mentorship: { teacherId, status: "ACTIVE" } },
      select: { dayOfWeek: true, startTime: true, duration: true },
    });
    const occupied = expandWindows(slotsToWindows(existingSlots), teacherTimeZone, now, HORIZON_DAYS);

    const planned = planWeeklySlots(studentIntervals, teacherIntervals, occupied, teacherTimeZone);
    if (planned.length === 0) return null;

    const mentorship = mentorshipId
      ? await tx.mentorship.update({ where: { id: mentorshipId }, data: {}, select: { id: true } })
      : await tx.mentorship.upsert({
          where: { teacherId_studentId: { teacherId, studentId } },
          create: { teacherId, studentId },
          update: { status: "ACTIVE" },
          select: { id: true },
        });

    await tx.recurringSlot.deleteMany({ where: { mentorshipId: mentorship.id } });
    await tx.recurringSlot.createMany({
      data: planned.map((slot) => ({
        mentorshipId: mentorship.id,
        type: slot.type,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        duration: slot.duration,
      })),
    });

    return mentorship.id;
  });
}

/**
 * Materialises the sessions the weekly slots imply.
 *
 * Idempotent: a slot that already has a session for a date is left alone, so a
 * re-run after an outage fills the gap without duplicating the rest.
 */
export async function generateUpcomingAppointments(mentorshipId: string, days = HORIZON_DAYS): Promise<number> {
  const mentorship = await db.mentorship.findUnique({
    where: { id: mentorshipId },
    select: { teacherId: true, recurringSlots: true },
  });
  if (!mentorship || mentorship.recurringSlots.length === 0) return 0;

  const timeZone = await timeZoneFor(mentorship.teacherId);
  const now = new Date();
  const origin = zonedParts(now, timeZone);
  let created = 0;

  for (let offset = 0; offset < days; offset++) {
    const date = addDays(origin.year, origin.month, origin.day, offset);
    const dayOfWeek = weekdayOfDate(date.year, date.month, date.day);

    for (const slot of mentorship.recurringSlots) {
      if (slot.dayOfWeek !== dayOfWeek) continue;
      const time = parseTime(slot.startTime);
      if (!time) continue;

      const startTime = zonedTimeToUtc(date.year, date.month, date.day, time[0], time[1], timeZone);
      const endTime = new Date(startTime.getTime() + slot.duration * 60_000);
      if (endTime.getTime() < now.getTime()) continue;

      const existing = await db.appointment.findFirst({
        where: { mentorshipId, sessionType: slot.type, startTime },
        select: { id: true },
      });
      if (existing) continue;

      await db.appointment.create({
        data: {
          mentorshipId,
          teacherId: mentorship.teacherId,
          title: slot.type === "DAILY_HIFDH" ? "Daily Hifdh Session" : "Muraja'ah Session",
          startTime,
          endTime,
          sessionType: slot.type,
          status: "SCHEDULED",
        },
      });
      created++;
    }
  }

  return created;
}

/**
 * Returns the appointment for today's daily session, creating it if the
 * scheduler has not already materialised it.
 */
export async function createTodaysAppointment(studentId: string): Promise<{ id: string } | null> {
  const slot = await getTodayHifdhSlot(studentId);
  if (!slot) return null;

  const mentorship = await db.mentorship.findFirst({
    where: { studentId, status: "ACTIVE" },
    select: { id: true, teacherId: true },
  });
  if (!mentorship) return null;

  const existing = await db.appointment.findFirst({
    where: { mentorshipId: mentorship.id, sessionType: "DAILY_HIFDH", startTime: slot.startTime },
    select: { id: true },
  });
  if (existing) return existing;

  return db.appointment.create({
    data: {
      mentorshipId: mentorship.id,
      teacherId: mentorship.teacherId,
      title: "Daily Hifdh Session",
      startTime: slot.startTime,
      endTime: slot.endTime,
      sessionType: "DAILY_HIFDH",
      status: "SCHEDULED",
    },
    select: { id: true },
  });
}

/**
 * Force-creates a session starting now, even with no slot for today.
 *
 * Only reachable behind TEST_MODE: it exists so a live session can be driven
 * without waiting for the clock, and still needs an active pairing because a
 * session has no meaning without a teacher to join it.
 */
export async function createTestAppointment(studentId: string): Promise<{ id: string } | null> {
  const mentorship = await db.mentorship.findFirst({
    where: { studentId, status: "ACTIVE" },
    select: { id: true, teacherId: true },
  });
  if (!mentorship) return null;

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + DAILY_DURATION * 60_000);

  return db.appointment.create({
    data: {
      mentorshipId: mentorship.id,
      teacherId: mentorship.teacherId,
      title: "Daily Hifdh Session (Test)",
      startTime,
      endTime,
      sessionType: "DAILY_HIFDH",
      status: "SCHEDULED",
    },
    select: { id: true },
  });
}
