import "server-only";

import { db } from "./db";

export interface AgendaSession {
  id: string;
  title: string | null;
  startTime: Date;
  endTime: Date | null;
  sessionType: string;
  isTeacher: boolean;
  otherPartyName: string;
}

/**
 * The sessions a person is due to attend or host, soonest first.
 *
 * Reads both sides of every pairing the person belongs to — as the student
 * through the pairing, as the teacher directly — so the dashboard does not need
 * to know which role is looking.
 */
export async function getUpcomingSessions(userId: string, days = 7): Promise<AgendaSession[]> {
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const rows = await db.appointment.findMany({
    where: {
      status: { in: ["SCHEDULED", "ONGOING"] },
      startTime: { gte: now, lte: until },
      OR: [{ teacherId: userId }, { mentorship: { studentId: userId } }],
    },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      sessionType: true,
      teacherId: true,
      mentorship: {
        select: {
          student: { select: { name: true } },
          teacher: { select: { name: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    startTime: row.startTime,
    endTime: row.endTime,
    sessionType: row.sessionType,
    isTeacher: row.teacherId === userId,
    otherPartyName: row.teacherId === userId ? row.mentorship.student.name : row.mentorship.teacher.name,
  }));
}

/** The number of sessions a person is due to host or attend in a window. */
export async function countSessionsBetween(userId: string, from: Date, to: Date): Promise<number> {
  return db.appointment.count({
    where: {
      status: { in: ["SCHEDULED", "ONGOING"] },
      startTime: { gte: from, lte: to },
      OR: [{ teacherId: userId }, { mentorship: { studentId: userId } }],
    },
  });
}
