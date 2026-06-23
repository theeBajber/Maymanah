import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    const appointments = await prisma.appointment.findMany({
      where: userRole === "TEACHER"
        ? { teacherId: userId }
        : { mentorship: { studentId: userId } },
      include: {
        teacher: { select: { id: true, name: true, image: true } },
        mentorship: {
          include: {
            student: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    const mapped = appointments.map((a) => ({
      id: a.id,
      title: a.title,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      meetingUrl: a.meetingUrl,
      teacher: a.teacher ? { id: a.teacher.id, name: a.teacher.name, image: a.teacher.image } : null,
      student: a.mentorship?.student
        ? { id: a.mentorship.student.id, name: a.mentorship.student.name, image: a.mentorship.student.image }
        : null,
    }));

    return NextResponse.json({ appointments: mapped });
  } catch (error) {
    console.error("Fetch appointments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
