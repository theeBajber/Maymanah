import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SessionsClient from "./SessionsClient";

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const today = new Date();
  const todayDay = today.getDay();

  if (session.user.role === "TEACHER") {
    const slots = await prisma.recurringSlot.findMany({
      where: { mentorship: { teacherId: session.user.id, status: "ACTIVE" } },
      include: {
        mentorship: {
          select: { student: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const todaySlots = slots.filter((s) => s.dayOfWeek === todayDay);

    const mapped = slots.map((s) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      type: s.type,
      studentName: s.mentorship.student.name ?? undefined,
      studentId: s.mentorship.student.id,
    }));

    const mappedToday = todaySlots.map((s) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      type: s.type,
      studentName: s.mentorship.student.name ?? undefined,
      studentId: s.mentorship.student.id,
    }));

    return (
      <SessionsClient
        role="TEACHER"
        slots={mapped}
        todayDay={todayDay}
        todaySlots={mappedToday}
      />
    );
  }

  const mentorship = await prisma.mentorship.findFirst({
    where: { studentId: session.user.id, status: "ACTIVE" },
    include: {
      teacher: { select: { name: true } },
      recurringSlots: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  const mapped = (mentorship?.recurringSlots ?? []).map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    type: s.type,
  }));

  return (
    <SessionsClient
      role="STUDENT"
      slots={mapped}
      todayDay={todayDay}
      teacherName={mentorship?.teacher.name ?? undefined}
    />
  );
}
