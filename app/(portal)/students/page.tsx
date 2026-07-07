import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentsClient from "./StudentsClient";

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

  const students = matches.map((m) => {
    const progress = m.student.quranProgress?.[0];
    return {
      id: m.student.id,
      name: m.student.name,
      lastSurah: progress?.lastSurah ?? null,
      lastVerse: progress?.lastVerse ?? null,
      openNotesCount: m.student.studentNotes.length,
    };
  });

  return <StudentsClient students={students} />;
}
