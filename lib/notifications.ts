import "server-only";

import { db } from "./db";

/**
 * Records something worth interrupting someone for.
 *
 * Called alongside the event, never instead of it: sending a message writes
 * both the message and its notification in the same flow, so a notification
 * can never exist for something that did not happen. Failures are swallowed
 * after logging, because a notification that cannot be recorded must not fail
 * the action it describes.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  metadata,
}: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  metadata?: Record<string, string>;
}): Promise<void> {
  try {
    await db.notification.create({
      data: { userId, type, title, body, metadata: metadata ?? {} },
    });
  } catch (error) {
    console.error("Could not record notification", error);
  }
}

/** How many unread notifications an account holds, for the badge count. */
export async function unreadNotificationCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, isRead: false } });
}
