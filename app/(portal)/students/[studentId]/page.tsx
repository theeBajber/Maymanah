import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { amiri } from "@/components/ui/fonts";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import { StudentNotesClient } from "./StudentNotesClient";

export const dynamic = "force-dynamic";

type PageContext = { params: Promise<{ studentId: string }> };

export default async function StudentDetail({ params }: PageContext) {
  const { studentId } = await params;

  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const ustadhId = session.user.id;

  const match = await prisma.mentorship.findFirst({
    where: { teacherId: ustadhId, studentId, status: "ACTIVE" },
  });

  if (!match) redirect("/students");

  const [student, notes, completedSessions, journalEntries, totalSessions] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, quranProgress: true },
      }),
      prisma.studentNote.findMany({
        where: { studentId, ustadhId },
        include: {
          session: { select: { startTime: true, surahNumber: true, verseNumber: true } },
        },
        orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
      }),
      prisma.appointment.findMany({
        where: { mentorshipId: match.id, status: "COMPLETED" },
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

  if (!student) redirect("/students");

  const progress = student.quranProgress?.[0];

  const accuracyValues = [...journalEntries].reverse();
  const accuracyTrend =
    accuracyValues.length > 0
      ? accuracyValues.map((j) => `${Math.round(j.accuracy)}%`).join(" → ")
      : null;

  const openNotes = notes
    .filter((n) => !n.resolved)
    .sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const diff = order[a.priority] - order[b.priority];
      if (diff !== 0) return diff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const resolvedNotes = notes.filter((n) => n.resolved);

  const sessions = completedSessions.map((s) => ({
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
  }));

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
<section className="bg-bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl text-primary ${amiri.className}`}>
          {student.name?.split(" ")[0] ?? "Student"}
        </h1>
        <Link
          href={`/portal/report?userId=${studentId}`}
          className="rounded-full bg-danger/10 px-4 py-2 text-danger font-medium hover:bg-danger/20 transition-colors flex items-center gap-2 text-sm"
        >
          <FontAwesomeIcon icon={faFlag} className="size-3.5" />
          Report
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Current Position</p>
              <p className="text-lg font-semibold mt-1">Surah {progress?.lastSurah ?? "?"}:{progress?.lastVerse ?? "?"}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Total Sessions</p>
              <p className="text-lg font-semibold mt-1">{totalSessions}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Accuracy Trend</p>
              <p className="text-sm font-medium mt-1 text-text-secondary">{accuracyTrend ?? "No data yet"}</p>
            </div>
          </div>
        </section>

        <StudentNotesClient
          studentId={studentId}
          openNotes={openNotes.map((n) => ({
            id: n.id,
            content: n.content,
            priority: n.priority,
            createdAt: n.createdAt.toISOString(),
            sessionDate: n.session?.startTime?.toISOString() ?? null,
          }))}
          resolvedNotes={resolvedNotes.map((n) => ({
            id: n.id,
            content: n.content,
            priority: n.priority,
            createdAt: n.createdAt.toISOString(),
            resolvedAt: n.resolvedAt?.toISOString() ?? null,
            sessionDate: n.session?.startTime?.toISOString() ?? null,
          }))}
          completedSessions={sessions}
        />
    </div>
  );
}
