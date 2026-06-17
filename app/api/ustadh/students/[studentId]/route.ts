import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ studentId: string }> };

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await params;
    const ustadhId = session.user.id;

    const match = await prisma.mentorship.findFirst({
      where: { teacherId: ustadhId, studentId, status: "ACTIVE" },
    });

    if (!match) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [
      student,
      notes,
      completedSessions,
      journalEntries,
      totalSessions,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          quranProgress: true,
        },
      }),
      prisma.studentNote.findMany({
        where: { studentId, ustadhId },
        include: {
          session: {
            select: { startTime: true, surahNumber: true, verseNumber: true },
          },
        },
        orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
      }),
      prisma.appointment.findMany({
        where: {
          mentorshipId: match.id,
          status: "COMPLETED",
        },
        include: {
          notes: {
            where: { ustadhId },
            select: { id: true, content: true, priority: true, createdAt: true },
          },
        },
        orderBy: { startTime: "desc" },
        take: 50,
      }),
      prisma.recitationJournal.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { accuracy: true, createdAt: true },
      }),
      prisma.appointment.count({
        where: { mentorshipId: match.id, status: "COMPLETED" },
      }),
    ]);

    if (!student) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const progress = student.quranProgress?.[0];

    const accuracyTrend = journalEntries
      .reverse()
      .map((j) => `${Math.round(j.accuracy)}%`)
      .join(" \u2192 ");

    const openNotes = notes
      .filter((n) => !n.resolved)
      .sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const diff = order[a.priority] - order[b.priority];
        if (diff !== 0) return diff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    const resolvedNotes = notes.filter((n) => n.resolved);

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.name?.split(" ")[0] ?? "Student",
        currentSurah: progress?.lastSurah ?? null,
        currentVerse: progress?.lastVerse ?? null,
      },
      totalSessions,
      accuracyTrend: accuracyTrend || null,
      openNotes: openNotes.map((n) => ({
        id: n.id,
        content: n.content,
        priority: n.priority,
        createdAt: n.createdAt.toISOString(),
        sessionDate: n.session?.startTime?.toISOString() ?? null,
        sessionSurah: n.session?.surahNumber ?? null,
        sessionVerse: n.session?.verseNumber ?? null,
      })),
      resolvedNotes: resolvedNotes.map((n) => ({
        id: n.id,
        content: n.content,
        priority: n.priority,
        createdAt: n.createdAt.toISOString(),
        resolvedAt: n.resolvedAt?.toISOString() ?? null,
        sessionDate: n.session?.startTime?.toISOString() ?? null,
      })),
      completedSessions: completedSessions.map((s) => ({
        id: s.id,
        date: s.startTime.toISOString(),
        surahNumber: s.surahNumber,
        verseNumber: s.verseNumber,
        notes: s.notes.map((n) => ({
          id: n.id,
          content: n.content,
          priority: n.priority,
          createdAt: n.createdAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
