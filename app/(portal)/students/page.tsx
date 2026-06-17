import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBookOpen, faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import { amiri } from "@/components/ui/fonts";
import { TopNav } from "@/components/ui/PortalNav";

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

  return (
    <div className="flex flex-col max-w-4xl w-full h-full pt-16 mx-auto">
      <TopNav />
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <section>
          <h1 className={`text-3xl text-primary ${amiri.className}`}>
            My Students
          </h1>
          <p className="text-text-secondary mt-1">
            {matches.length} active student{matches.length !== 1 ? "s" : ""}
          </p>
        </section>

        {matches.length === 0 ? (
          <div className="bg-bg-card rounded-xl p-8 text-center border border-border">
            <FontAwesomeIcon icon={faBookOpen} className="text-3xl text-text-muted mb-3" />
            <p className="text-text-secondary">No active students assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const progress = m.student.quranProgress?.[0];
              return (
                <Link
                  key={m.student.id}
                  href={`/students/${m.student.id}`}
                  className="bg-bg-card rounded-xl p-5 border border-border hover:border-primary hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-lg">
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
                  <FontAwesomeIcon icon={faArrowRight} className="text-text-muted group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
