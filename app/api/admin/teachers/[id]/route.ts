import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, getTeacherProfile } from "@/lib/admin";
import { logAuditEvent } from "@/lib/audit";
import { sendTeacherRejectionEmail, sendTeacherApprovalEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const putSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
  reliabilityScore: z.number().min(0).max(100).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const teacher = await getTeacherProfile(id);
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json(teacher);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin teacher fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { action, reason, reliabilityScore } = parsed.data;

    const teacher = await safeQuery(() =>
      prisma.user.findUnique({
        where: { id, role: "TEACHER" },
        include: { ustadhProfile: true },
      }),
    );

    if (!teacher || !teacher.ustadhProfile) {
      return NextResponse.json(
        { error: "Teacher not found or no profile exists" },
        { status: 404 },
      );
    }

    if (action === "approve") {
      await safeQuery(() =>
        prisma.ustadhProfile.update({
          where: { userId: id },
          data: {
            isApproved: true,
            rejectedAt: null,
            ...(reliabilityScore !== undefined ? { reliabilityScore } : {}),
          },
        }),
      );

      await logAuditEvent({
        action: "ADMIN_TEACHER_APPROVED",
        userId: session.user.id,
        metadata: { teacherId: id, teacherName: teacher.name },
      });

      if (teacher.email) {
        await sendTeacherApprovalEmail(teacher.email, teacher.name || "Teacher");
      }

      revalidatePath("/admin/teachers");
    } else if (action === "reject") {
      await safeQuery(() =>
        prisma.ustadhProfile.update({
          where: { userId: id },
          data: { isApproved: false, rejectedAt: new Date() },
        }),
      );

      await logAuditEvent({
        action: "ADMIN_TEACHER_REJECTED",
        userId: session.user.id,
        metadata: { teacherId: id, teacherName: teacher.name, reason },
      });

      if (teacher.email) {
        await sendTeacherRejectionEmail(teacher.email, teacher.name || "Teacher", reason);
      }

      revalidatePath("/admin/teachers");
    }

    const updated = await getTeacherProfile(id);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin teacher update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
