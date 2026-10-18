import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { pairHifdhStudent } from "@/lib/pairing";
import { getCurrentUser } from "@/lib/session";

/**
 * Matches the signed-in student with a teacher, or returns the existing pairing.
 *
 * Availability is a precondition rather than something this endpoint writes, so
 * a student cannot be matched on a schedule they never gave. Both sides are told
 * about a new pairing; a repeat call that merely re-reads one stays quiet.
 */
export async function POST(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const availability = await db.availability.count({ where: { userId: user.id, isRecurring: true } });
  if (availability === 0) {
    return NextResponse.json({ error: "Set your availability first" }, { status: 400 });
  }

  const before = await db.mentorship.findFirst({
    where: { studentId: user.id, status: "ACTIVE" },
    select: { _count: { select: { recurringSlots: true } } },
  });
  const alreadyPaired = (before?._count.recurringSlots ?? 0) > 0;

  const schedule = await pairHifdhStudent(user.id);
  if (!schedule) {
    return NextResponse.json({ error: "No available teacher found" }, { status: 404 });
  }

  if (!alreadyPaired) {
    await Promise.all([
      createNotification({
        userId: user.id,
        type: "mentorship_paired",
        title: "You've been paired with a teacher",
        body: `${schedule.teacherName} will guide your Hifdh sessions. View your schedule to see your upcoming sessions.`,
        metadata: { mentorshipId: schedule.mentorshipId, link: "/courses/hifdh-ul-quran" },
      }),
      createNotification({
        userId: schedule.teacherId,
        type: "mentorship_paired",
        title: "A new student has been paired with you",
        body: `${user.name} has been matched with you for Hifdh mentorship.`,
        metadata: { mentorshipId: schedule.mentorshipId, link: "/students" },
      }),
    ]);
  }

  return NextResponse.json({ success: true, mentorshipId: schedule.mentorshipId, teacherName: schedule.teacherName });
}
