import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "@/lib/admin";
import { logAuditEvent } from "@/lib/audit";
import { issueCertificate } from "@/lib/certificate";

export async function GET() {
  try {
    await requireAdmin();

    const certificates = await db.ijazah.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin certificates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: "userId and courseId are required" }, { status: 400 });
    }

    const existing = await db.ijazah.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Certificate already exists for this user and course" }, { status: 409 });
    }

    const [user, course] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { id: true } }),
      db.course.findUnique({ where: { id: courseId }, select: { id: true } }),
    ]);

    if (!user || !course) {
      return NextResponse.json({ error: "User or course not found" }, { status: 404 });
    }

    const ijazah = await issueCertificate(userId, courseId);

    await logAuditEvent({
      action: "ADMIN_CERTIFICATE_ISSUED",
      userId: session.user.id,
      email: session.user.email,
      metadata: { targetUserId: userId, courseId },
    });

    return NextResponse.json(ijazah, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin certificate create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
