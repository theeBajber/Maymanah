import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mentorshipId = (await params).id;

    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      select: { studentId: true },
    });

    if (!mentorship) {
      return NextResponse.json({ error: "Mentorship not found" }, { status: 404 });
    }

    if (mentorship.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.mentorship.update({
        where: { id: mentorshipId },
        data: { status: "PAUSED" },
      });
      await tx.availability.deleteMany({
        where: { userId: session.user!.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Re-pair error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
