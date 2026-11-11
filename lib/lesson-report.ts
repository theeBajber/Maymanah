import "server-only";

import type { AttendanceStatus } from "@prisma/client";

import { db } from "./db";
import { createNotification } from "./notifications";
import {
  absoluteAyah,
  positionToAyah,
  rangeLabel,
  validateAyahRange,
  type AyahRangeInput,
  type RangeProblem,
} from "./quran-meta";

export interface LessonReportInput {
  appointmentId: string;
  teacherId: string;
  attendance: AttendanceStatus;
  /** The newly memorised range, or null when nothing new was covered. */
  range: AyahRangeInput | null;
  revision?: string | null;
  rating?: number | null;
  notes?: string | null;
  nextAssignment?: string | null;
}

export type LessonReportFailure =
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "not_teacher" }
  | { ok: false; reason: "range_on_absent" }
  | { ok: false; reason: "invalid_range"; problem: RangeProblem };

export type LessonReportResult = { ok: true; reportId: string } | LessonReportFailure;

/**
 * Records how a session went and moves the student's progress forward.
 *
 * Only the assigned teacher may submit. The report and the ledger entry commit
 * together, so a crash cannot leave a submitted report whose memorisation was
 * never counted. A range is refused for an absence: nothing was memorised in a
 * session the student did not attend.
 */
export async function submitLessonReport(input: LessonReportInput): Promise<LessonReportResult> {
  const appointment = await db.appointment.findUnique({
    where: { id: input.appointmentId },
    select: {
      id: true,
      teacherId: true,
      mentorship: { select: { studentId: true } },
    },
  });

  if (!appointment) return { ok: false, reason: "not_found" };
  if (appointment.teacherId !== input.teacherId) return { ok: false, reason: "not_teacher" };

  const range = input.range;
  if (range) {
    const valid = validateAyahRange(range);
    if (!valid.ok) return { ok: false, reason: "invalid_range", problem: valid.reason };
    if (input.attendance === "ABSENT" || input.attendance === "EXCUSED") {
      return { ok: false, reason: "range_on_absent" };
    }
  }

  const studentId = appointment.mentorship.studentId;
  const now = new Date();

  const outcome = await db.$transaction(async (tx) => {
    const existing = await tx.lessonReport.findUnique({
      where: { appointmentId: input.appointmentId },
      select: { id: true },
    });

    const data = {
      attendance: input.attendance,
      fromSurah: range?.fromSurah ?? null,
      fromVerse: range?.fromAyah ?? null,
      toSurah: range?.toSurah ?? null,
      toVerse: range?.toAyah ?? null,
      revision: input.revision ?? null,
      rating: input.rating ?? null,
      notes: input.notes ?? null,
      nextAssignment: input.nextAssignment ?? null,
      submittedById: input.teacherId,
      submittedAt: now,
    };

    const report = existing
      ? await tx.lessonReport.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await tx.lessonReport.create({
          data: { appointmentId: input.appointmentId, ...data },
          select: { id: true },
        });

    if (range) {
      await tx.memorizedRange.upsert({
        where: { reportId: report.id },
        create: {
          studentId,
          reportId: report.id,
          startSurah: range.fromSurah,
          startAyah: range.fromAyah,
          endSurah: range.toSurah,
          endAyah: range.toAyah,
        },
        update: {
          startSurah: range.fromSurah,
          startAyah: range.fromAyah,
          endSurah: range.toSurah,
          endAyah: range.toAyah,
        },
      });

      // The stored position is the furthest ayah reached, never a step back.
      const end = absoluteAyah(range.toSurah, range.toAyah);
      const position = end === null ? null : positionToAyah(end);
      if (end !== null && position) {
        const current = await tx.quranProgress.findUnique({
          where: { userId: studentId },
          select: { lastSurah: true, lastVerse: true },
        });
        const currentEnd = current ? absoluteAyah(current.lastSurah, current.lastVerse) ?? 0 : 0;

        if (end > currentEnd) {
          await tx.quranProgress.upsert({
            where: { userId: studentId },
            create: { userId: studentId, lastSurah: position.surah, lastVerse: position.ayah },
            update: { lastSurah: position.surah, lastVerse: position.ayah },
          });
        }
      }
    }

    // A submitted report is the teacher's confirmation that the session took
    // place, so it also clears a session the cron may have marked missed.
    await tx.appointment.update({
      where: { id: input.appointmentId },
      data: { status: "COMPLETED", missed: false },
    });

    return { reportId: report.id, created: !existing };
  });

  if (outcome.created) {
    await createNotification({
      userId: studentId,
      type: "lesson_report",
      title: "Your lesson report is ready",
      body: range
        ? `New memorisation recorded: ${rangeLabel(range)}. Open the session to see your teacher's notes.`
        : "Open the session to see your teacher's notes and next assignment.",
      metadata: { appointmentId: input.appointmentId, link: `/session/${input.appointmentId}` },
    });
  }

  return { ok: true, reportId: outcome.reportId };
}

/** The report a session already has, or null while it is pending. */
export async function lessonReportFor(appointmentId: string) {
  return db.lessonReport.findUnique({
    where: { appointmentId },
    select: {
      id: true,
      attendance: true,
      fromSurah: true,
      fromVerse: true,
      toSurah: true,
      toVerse: true,
      revision: true,
      rating: true,
      notes: true,
      nextAssignment: true,
      submittedAt: true,
      submittedBy: { select: { id: true, name: true } },
    },
  });
}

/**
 * Sessions a teacher has finished but not yet reported on.
 *
 * The cron marks a past session missed when nobody joined, so it counts here
 * too: a missed session still needs a report explaining the absence, and the
 * teacher can then mark it EXCUSED without it counting against the student.
 */
export async function pendingLessonReports(teacherId: string, days = 14) {
  const now = new Date();
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return db.appointment.findMany({
    where: {
      teacherId,
      startTime: { lt: now, gte: since },
      report: { is: null },
      OR: [
        { status: { in: ["SCHEDULED", "ONGOING", "COMPLETED"] } },
        { status: "CANCELLED", missed: true },
      ],
    },
    orderBy: { startTime: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      startTime: true,
      sessionType: true,
      mentorship: { select: { student: { select: { name: true } } } },
    },
  });
}
