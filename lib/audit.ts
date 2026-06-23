import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "LOGIN_FAILED"
  | "LOGIN_SUCCESS"
  | "PASSWORD_CHANGED"
  | "ACCOUNT_DELETED"
  | "REGISTERED"
  | "ADMIN_COURSE_CREATED"
  | "ADMIN_COURSE_UPDATED"
  | "ADMIN_COURSE_DELETED"
  | "ADMIN_LESSON_CREATED"
  | "ADMIN_LESSON_UPDATED"
  | "ADMIN_LESSON_DELETED"
  | "ROLE_CHANGED";

export async function logAuditEvent(params: {
  action: AuditAction;
  userId?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.userId,
        email: params.email,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        ipAddress: null,
      },
    });
  } catch {
    // Audit logging should never break the app
  }
}
