import type { Metadata } from "next";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";

import { EmptyState, PortalHeader } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "My Students" };

export const dynamic = "force-dynamic";

export default async function MyStudents() {
  const user = await getCurrentUser(await auth());
  if (!user) redirect("/login");
  if (user.role !== "TEACHER") redirect("/dashboard");

  const matches = await db.mentorship.findMany({
    where: { teacherId: user.id, status: "ACTIVE" },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          quranProgress: { select: { lastSurah: true, lastVerse: true } },
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="stagger-fade mx-auto max-w-4xl space-y-6 p-6">
      <PortalHeader
        title="My Students"
        subtitle={`${matches.length} active student${matches.length !== 1 ? "s" : ""}`}
      />

      {matches.length === 0 ? (
        <EmptyState title="No active students assigned yet." />
      ) : (
        <div className="space-y-2">
          {matches.map((match, index) => {
            const progress = match.student.quranProgress;
            return (
              <Link
                key={match.student.id}
                href={`/students/${match.student.id}`}
                style={{ "--i": index } as CSSProperties}
                className="hover-lift stagger-item group flex items-center justify-between rounded-2xl border border-border bg-bg-elevated p-5 shadow-raise hover:border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                    <Users className="size-4.5" />
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">
                      {match.student.name?.split(" ")[0] ?? "Student"}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Surah {progress?.lastSurah ?? "?"}:{progress?.lastVerse ?? "?"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-text-muted transition-colors group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
