import { NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  getUserDetails,
  updateUserRole,
  deleteUser,
} from "@/lib/admin";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const putSchema = z.object({
  action: z.enum(["changeRole", "delete"]),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const user = await getUserDetails(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin user fetch error:", error);
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

    if (parsed.data.action === "changeRole" && parsed.data.role) {
      // Only SUPERADMIN can promote to ADMIN
      if (parsed.data.role === "ADMIN" && session.user.role !== "SUPERADMIN") {
        return NextResponse.json(
          { error: "Only super admins can assign ADMIN role" },
          { status: 403 },
        );
      }

      const user = await updateUserRole(id, parsed.data.role);

      await logAuditEvent({
        action: "ADMIN_USER_ROLE_CHANGED",
        userId: session.user.id,
        metadata: { targetUserId: id, newRole: parsed.data.role },
      });

      revalidatePath("/admin/users");
      return NextResponse.json(user);
    }

    if (parsed.data.action === "delete") {
      await logAuditEvent({
        action: "ADMIN_USER_DELETED",
        userId: session.user.id,
        metadata: { targetUserId: id },
      });

      await deleteUser(id);
      revalidatePath("/admin/users");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
