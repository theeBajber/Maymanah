import type { Metadata } from "next";
import { BookOpen, CheckSquare, Flag, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { amiri } from "@/app/ui/fonts";
import { EmptyState, Panel, StatTile } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type PageContext = { params: Promise<{ studentId: string }> };

export async function generateMetadata({ params }: PageContext): Promise<Metadata> {
  const { studentId } = await params;
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { name: true },
  });
  return { title: student?.name ?? "Student" };
}

export default async function StudentDetail({ params }: PageContext) {
  const { studentId } = await params;

  const user = await getCurrentUser(await auth());
  if (!user) redirect("/login");
  if (user.role !== "TEACHER") redirect("/dashboard");

  const match = await db.mentorship.findFirst({
    where: { teacherId: user.id, studentId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!match) redirect("/students");

  const [student, completedSessions, journalEntries, totalSessions] = await Promise.all([
    db.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, quranProgress: true },
    }),
    db.appointment.findMany({
      where: { mentorshipId: match.id, status: "COMPLETED" },
      include: { sessionPlan: true },
      orderBy: { startTime: "desc" },
      take: 50,
    }),
    db.recitationJournal.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { accuracy: true, createdAt: true },
    }),
    db.appointment.count({ where: { mentorshipId: match.id, status: "COMPLETED" } }),
  ]);

  if (!student) redirect("/students");

  const progress = student.quranProgress;
  const accuracyTrend =
    journalEntries.length > 0
      ? [...journalEntries]
          .reverse()
          .map((entry) => `${Math.round(entry.accuracy)}%`)
          .join(" → ")
      : null;

  return (
    <div className="stagger-fade mx-auto max-w-4xl space-y-6 p-6">
      <Panel className="p-6">
        <div className="flex items-center justify-between">
          <h1 className={`${amiri.className} text-3xl text-primary`}>
            {student.name?.split(" ")[0] ?? "Student"}
          </h1>
          <Link
            href={`/report?userId=${studentId}`}
            className="flex items-center gap-2 rounded-full bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
          >
            <Flag className="size-3.5" />
            Report
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatTile
            icon={GraduationCap}
            value={`Surah ${progress?.lastSurah ?? "?"}:${progress?.lastVerse ?? "?"}`}
            label="Current Position"
          />
          <StatTile icon={CheckSquare} value={totalSessions} label="Total Sessions" />
          <StatTile
            icon={BookOpen}
            value={accuracyTrend ?? "—"}
            label="Accuracy Trend"
            tone="info"
          />
        </div>
      </Panel>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">Completed Sessions</h2>
        {completedSessions.length === 0 ? (
          <EmptyState title="No completed sessions yet." />
        ) : (
          <div className="space-y-2">
            {completedSessions.map((session) => (
              <Panel key={session.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {new Date(session.startTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {session.surahNumber
                      ? `Surah ${session.surahNumber}:${session.verseNumber ?? 1}`
                      : session.title ?? "Session"}
                  </p>
                </div>
                {session.sessionPlan ? (
                  <p className="text-xs text-text-muted">
                    Plan: {session.sessionPlan.fromSurah}:{session.sessionPlan.fromVerse}–
                    {session.sessionPlan.toSurah}:{session.sessionPlan.toVerse}
                  </p>
                ) : null}
              </Panel>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
