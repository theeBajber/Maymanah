import { requireAdmin, getTeacherProfile } from "@/lib/admin";
import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
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

  const [students, recentSessions] = await Promise.all([
    safeQuery(() =>
      prisma.mentorship.findMany({
        where: { teacherId: id, status: "ACTIVE" },
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { startedAt: "desc" },
      }),
    ),
    safeQuery(() =>
      prisma.appointment.findMany({
        where: { teacherId: id },
        include: {
          mentorship: { select: { student: { select: { id: true, name: true } } } },
        },
        orderBy: { startTime: "desc" },
        take: 10,
      }),
    ),
  ]);

  return (
    <TeacherDetail
      teacher={teacher}
      students={students}
      recentSessions={recentSessions}
    />
  );
}
