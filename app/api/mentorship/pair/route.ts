import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { autoPairHifdhStudent } from "@/lib/mentorship";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { gender: true },
    });

    const studentAvail = await prisma.availability.findMany({
      where: { userId: session.user.id, isRecurring: true },
    });
    if (studentAvail.length === 0) {
      return NextResponse.json({ error: "Set your availability first" }, { status: 400 });
    }

    const teacherCounts = await Promise.all([
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "TEACHER", gender: student?.gender ?? undefined } }),
      prisma.user.count({
        where: {
          role: "TEACHER",
          gender: student?.gender ?? undefined,
          ustadhProfile: { isApproved: true },
        },
      }),
      prisma.user.count({
        where: {
          role: "TEACHER",
          gender: student?.gender ?? undefined,
          ustadhProfile: { isApproved: true, availableForTeaching: true },
        },
      }),
    ]);

    const mentorship = await autoPairHifdhStudent(session.user.id);
    if (!mentorship) {
      return NextResponse.json({
        error: "No available teacher found",
        debug: {
          studentGender: student?.gender,
          studentAvailCount: studentAvail.length,
          totalTeachers: teacherCounts[0],
          sameGender: teacherCounts[1],
          approved: teacherCounts[2],
          availableForTeaching: teacherCounts[3],
        },
      }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pairing error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
