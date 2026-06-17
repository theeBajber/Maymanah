import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ustadhId = session.user.id;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [todaySessions, weekSessions, activeMatches, completedThisMonth] =
      await Promise.all([
        prisma.appointment.findMany({
          where: {
            teacherId: ustadhId,
            startTime: { gte: startOfDay, lt: endOfDay },
          },
          include: {
            mentorship: {
              include: {
                student: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { startTime: "asc" },
        }),
        prisma.appointment.findMany({
          where: {
            teacherId: ustadhId,
            startTime: { gte: startOfWeek, lt: endOfWeek },
          },
          include: {
            mentorship: {
              include: {
                student: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { startTime: "asc" },
        }),
        prisma.mentorship.findMany({
          where: { teacherId: ustadhId, status: "ACTIVE" },
          include: {
            student: {
              select: { id: true, name: true },
              include: {
                quranProgress: true,
                studentNotes: {
                  where: { ustadhId, resolved: false },
                  select: { id: true },
                },
              },
            },
          },
        }),
        prisma.appointment.count({
          where: {
            teacherId: ustadhId,
            status: "COMPLETED",
            startTime: { gte: startOfMonth, lt: endOfMonth },
          },
        }),
      ]);

    const students = activeMatches.map((m) => {
      const progress = m.student.quranProgress?.[0];
      return {
        studentId: m.student.id,
        firstName: m.student.name?.split(" ")[0] ?? "Student",
        currentSurah: progress?.lastSurah ?? null,
        currentVerse: progress?.lastVerse ?? null,
        openNoteCount: m.student.studentNotes.length,
      };
    });

    return NextResponse.json({
      todaySessions: todaySessions.map((s) => ({
        id: s.id,
        studentFirstName: s.mentorship.student.name?.split(" ")[0] ?? "Student",
        studentId: s.mentorship.student.id,
        scheduledAt: s.startTime.toISOString(),
        status: s.status,
        meetingUrl: s.meetingUrl,
      })),
      weekSessions: weekSessions.map((s) => ({
        id: s.id,
        studentFirstName: s.mentorship.student.name?.split(" ")[0] ?? "Student",
        studentId: s.mentorship.student.id,
        scheduledAt: s.startTime.toISOString(),
        status: s.status,
        dayOfWeek: s.startTime.getDay(),
      })),
      students,
      stats: {
        activeStudents: activeMatches.length,
        completedThisMonth,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
