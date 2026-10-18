import "server-only";

import { db } from "./db";

/**
 * How often a person joined their sessions, as a percentage.
 *
 * Counts only sessions whose time has passed, so an upcoming booking with no
 * join yet is not mistaken for a miss and does not unfairly drag the score
 * down. Returns null when there is nothing to measure yet, which is distinct
 * from zero attendance.
 */
export async function getReliabilityScore(userId: string): Promise<number | null> {
  const appointments = await db.appointment.findMany({
    where: {
      OR: [{ teacherId: userId }, { mentorship: { studentId: userId } }],
      status: { in: ["SCHEDULED", "ONGOING", "COMPLETED"] },
      startTime: { lte: new Date() },
    },
    orderBy: { startTime: "desc" },
    take: 20,
    select: { joinedAt: true },
  });

  if (appointments.length === 0) return null;

  const joined = appointments.filter((a) => a.joinedAt !== null).length;
  return Math.round((joined / appointments.length) * 100);
}
