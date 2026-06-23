import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBookOpen, faNoteSticky } from "@fortawesome/free-solid-svg-icons";

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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <section>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          My Students
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {matches.length} active student{matches.length !== 1 ? "s" : ""}
        </p>
      </section>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg-elevated/50 p-12 text-center">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FontAwesomeIcon icon={faBookOpen} className="text-primary text-lg" />
          </div>
          <p className="text-sm text-text-secondary">No active students assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => {
            const progress = m.student.quranProgress?.[0];
            return (
              <Link
                key={m.student.id}
                href={`/students/${m.student.id}`}
                className="rounded-2xl border border-border bg-bg-elevated p-5 hover:border-primary/30 hover:shadow-sm transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="font-semibold text-text-primary">
                    {m.student.name?.split(" ")[0] ?? "Student"}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                    <span>Surah {progress?.lastSurah ?? "?"}:{progress?.lastVerse ?? "?"}</span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faNoteSticky} className="size-3" />
                      {m.student.studentNotes.length} open note{m.student.studentNotes.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="text-text-muted group-hover:text-primary transition-colors size-4" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
