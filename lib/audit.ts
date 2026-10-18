import "server-only";

import { db } from "./db";

/**
 * Records an administrative act, or anything else worth showing in recent
 * activity.
 *
 * Never allowed to fail the act it describes: an audit row that cannot be
 * written is logged and dropped, because losing the record is better than
 * blocking the change.
 */
export async function logAuditEvent({
  action,
  userId,
  email,
  metadata,
}: {
  action: string;
  userId?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: { action, userId: userId ?? null, email: email ?? null, metadata: (metadata ?? {}) as object },
    });
  } catch (error) {
    console.error("Could not record audit event", error);
  }
}

/** Recent activity for the admin dashboard, newest first. */
export async function recentAuditEvents(take = 20) {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, action: true, userId: true, email: true, metadata: true, createdAt: true },
  });
}
