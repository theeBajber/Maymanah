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

    const matches = await prisma.mentorship.findMany({
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
      orderBy: { startedAt: "desc" },
    });

    const students = matches.map((m) => {
      const progress = m.student.quranProgress?.[0];
      return {
        studentId: m.student.id,
        firstName: m.student.name?.split(" ")[0] ?? "Student",
        currentSurah: progress?.lastSurah ?? null,
        currentVerse: progress?.lastVerse ?? null,
        openNoteCount: m.student.studentNotes.length,
      };
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
