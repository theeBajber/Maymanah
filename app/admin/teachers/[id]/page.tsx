import { notFound } from "next/navigation";

import { getTeacherProfile, requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { getReliabilityScore } from "@/lib/mentorship";

import { TeacherDetail } from "./TeacherDetail";

export const dynamic = "force-dynamic";

export default async function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const teacher = await getTeacherProfile(id);
  if (!teacher) notFound();

  const [students, recentSessions, computedReliability] = await Promise.all([
    db.mentorship.findMany({
      where: { teacherId: id, status: "ACTIVE" },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { startedAt: "desc" },
    }),
    db.appointment.findMany({
      where: { teacherId: id },
      include: { mentorship: { select: { student: { select: { id: true, name: true } } } } },
      orderBy: { startTime: "desc" },
      take: 10,
    }),
    getReliabilityScore(id).catch(() => null),
  ]);

  return (
    <TeacherDetail
      teacher={teacher}
      students={students}
      recentSessions={recentSessions}
      computedReliability={computedReliability}
    />
  );
}
