import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { joinStateFor } from "@/lib/live-session";
import { memorizationProgress } from "@/lib/quran-progress";
import { getCurrentUser } from "@/lib/session";
import { surahArabicName } from "@/lib/surah-arabic";

/*
 * Everything the session page shows before a call starts.
 *
 * Either side of the pairing may read it. The response separates what the
 * session is (`plan`), how it went (`report`), whether a call can start now
 * (`joinState`, with the window timestamps), and — for the teacher only — the
 * student context needed to prepare. The room address is never included.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const { id } = await params;

  const appointment = await db.appointment.findFirst({
    where: { id, OR: [{ mentorship: { studentId: user.id } }, { teacherId: user.id }] },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      sessionType: true,
      teacherId: true,
      mentorshipId: true,
      joinedAt: true,
      mentorship: {
        select: {
          studentId: true,
          student: { select: { name: true } },
          teacher: { select: { name: true } },
        },
      },
      sessionPlan: true,
      report: {
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
      },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "That session could not be found" }, { status: 404 });
  }

  const isTeacher = appointment.teacherId === user.id;
  const join = joinStateFor({
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
  });

  const teacherContext = isTeacher
    ? await buildTeacherContext({
        appointmentId: appointment.id,
        mentorshipId: appointment.mentorshipId,
        studentId: appointment.mentorship.studentId,
        teacherId: user.id,
        startTime: appointment.startTime,
      })
    : null;

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      sessionType: appointment.sessionType,
      isTeacher,
      studentId: appointment.mentorship.studentId,
      otherPartyName: isTeacher
        ? appointment.mentorship.student.name
        : appointment.mentorship.teacher.name,
      joinState: join.state,
      opensAt: join.opensAt,
      closesAt: join.closesAt,
    },
    plan: appointment.sessionPlan,
    report: appointment.report,
    teacherContext,
  });
}

/**
 * The preparation panel's read model.
 *
 * Sabaq, Sabqi, and Manzil are suggestions assembled from records that already
 * exist: the lesson plan, the previous report, and the memorisation ledger.
 * They are deliberately not stored as assignments — explicit fields are a later
 * milestone, and nothing here is presented as teacher-authored fact.
 */
async function buildTeacherContext(input: {
  appointmentId: string;
  mentorshipId: string;
  studentId: string;
  teacherId: string;
  startTime: Date;
}) {
  const [progress, lastReport, lastNote, earliest, latest, next] = await Promise.all([
    memorizationProgress(input.studentId),
    db.lessonReport.findFirst({
      where: {
        appointmentId: { not: input.appointmentId },
        appointment: { is: { mentorshipId: input.mentorshipId } },
      },
      orderBy: { submittedAt: "desc" },
      select: {
        attendance: true,
        rating: true,
        notes: true,
        revision: true,
        fromSurah: true,
        fromVerse: true,
        toSurah: true,
        toVerse: true,
        submittedAt: true,
      },
    }),
    db.studentNote.findFirst({
      where: {
        studentId: input.studentId,
        teacherId: input.teacherId,
        resolved: false,
      },
      orderBy: { createdAt: "desc" },
      select: { content: true, priority: true, createdAt: true },
    }),
    db.memorizedRange.findFirst({
      where: { studentId: input.studentId },
      orderBy: [{ startSurah: "asc" }, { startAyah: "asc" }],
      select: { startSurah: true, startAyah: true },
    }),
    db.memorizedRange.findFirst({
      where: { studentId: input.studentId },
      orderBy: [{ endSurah: "desc" }, { endAyah: "desc" }],
      select: { endSurah: true, endAyah: true },
    }),
    db.appointment.findFirst({
      where: {
        mentorshipId: input.mentorshipId,
        startTime: { gt: input.startTime },
        status: { in: ["SCHEDULED", "ONGOING"] },
      },
      orderBy: { startTime: "asc" },
      select: { startTime: true, sessionPlan: true },
    }),
  ]);

  const lastStop = progress.lastStop
    ? {
        surah: progress.lastStop.surah,
        ayah: progress.lastStop.ayah,
        surahName: progress.lastStop.surahName,
        arabicName: surahArabicName(progress.lastStop.surah),
      }
    : null;

  return {
    lastStop,
    progress: {
      uniqueAyahs: progress.uniqueAyahs,
      percent: progress.percent,
      rangeCount: progress.rangeCount,
    },
    lastReport: lastReport
      ? {
          ...lastReport,
          range:
            lastReport.fromSurah !== null &&
            lastReport.fromVerse !== null &&
            lastReport.toSurah !== null &&
            lastReport.toVerse !== null
              ? {
                  fromSurah: lastReport.fromSurah,
                  fromVerse: lastReport.fromVerse,
                  toSurah: lastReport.toSurah,
                  toVerse: lastReport.toVerse,
                }
              : null,
        }
      : null,
    lastNote,
    manzil:
      earliest && latest
        ? {
            fromSurah: earliest.startSurah,
            fromAyah: earliest.startAyah,
            toSurah: latest.endSurah,
            toAyah: latest.endAyah,
          }
        : null,
    nextPlan: next?.sessionPlan ?? null,
    nextSessionAt: next?.startTime ?? null,
  };
}
