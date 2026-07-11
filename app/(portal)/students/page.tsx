import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, StickyNote } from "lucide-react";
import { PortalHeader, EmptyState } from "@/components/ui/portal";

export const dynamic = "force-dynamic";

export default async function MyStudents() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const ustadhId = session.user.id;

  const matches = await prisma.mentorship.findMany({
    where: { teacherId: ustadhId, status: "ACTIVE" },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          quranProgress: { select: { lastSurah: true, lastVerse: true } },
          studentNotes: {
            where: { ustadhId, resolved: false },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="stagger-fade p-6 space-y-6 max-w-4xl mx-auto">
      <PortalHeader
        title="My Students"
        subtitle={`${matches.length} active student${matches.length !== 1 ? "s" : ""}`}
      />

      {matches.length === 0 ? (
        <EmptyState title="No active students assigned yet." />
      ) : (
        <div className="space-y-2">
          {matches.map((m, index) => {
            const progress = m.student.quranProgress?.[0];
            return (
              <Link
                key={m.student.id}
                href={`/students/${m.student.id}`}
                style={{ "--i": index } as React.CSSProperties}
                className="hover-lift stagger-item rounded-2xl border border-border bg-bg-elevated p-5 shadow-raise hover:border-primary/30 flex items-center justify-between group"
              >
                <div>
                  <p className="font-semibold text-text-primary">
                    {m.student.name?.split(" ")[0] ?? "Student"}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                    <span>Surah {progress?.lastSurah ?? "?"}:{progress?.lastVerse ?? "?"}</span>
                    <span className="flex items-center gap-1">
                      <StickyNote className="size-3" />
                      {m.student.studentNotes.length} open note{m.student.studentNotes.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <ArrowRight className="text-text-muted group-hover:text-primary transition-colors size-4" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
