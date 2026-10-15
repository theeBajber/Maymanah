import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { getCurrentUser } from "@/lib/session";
import { toMultiLine } from "@/lib/text";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const sendSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().transform(toMultiLine).pipe(z.string().min(1, "Write something first").max(5000)),
});

/**
 * Lists conversations, newest first.
 *
 * Each conversation carries its last message and its unread count, so the list
 * renders without a second round of queries. Partners include paired teachers
 * and students even before any message exists, so a new pairing is not an
 * empty screen.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const partnerId = new URL(request.url).searchParams.get("userId");

  if (partnerId) {
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user.id },
        ],
      },
      include: { sender: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  }

  const [sent, received, pairings] = await Promise.all([
    db.message.findMany({ where: { senderId: user.id }, select: { receiverId: true } }),
    db.message.findMany({ where: { receiverId: user.id }, select: { senderId: true } }),
    db.mentorship.findMany({
      where: { status: "ACTIVE", OR: [{ teacherId: user.id }, { studentId: user.id }] },
      select: { teacherId: true, studentId: true },
    }),
  ]);

  const partnerIds = new Set<string>();
  for (const row of sent) partnerIds.add(row.receiverId);
  for (const row of received) partnerIds.add(row.senderId);
  for (const pairing of pairings) {
    partnerIds.add(pairing.teacherId === user.id ? pairing.studentId : pairing.teacherId);
  }
  partnerIds.delete(user.id);

  const conversations = await Promise.all(
    [...partnerIds].map(async (id) => {
      const [partner, lastMessage, unreadCount] = await Promise.all([
        db.user.findUnique({ where: { id }, select: { id: true, name: true, image: true } }),
        db.message.findFirst({
          where: { OR: [{ senderId: user.id, receiverId: id }, { senderId: id, receiverId: user.id }] },
          orderBy: { createdAt: "desc" },
        }),
        db.message.count({ where: { senderId: id, receiverId: user.id, isRead: false } }),
      ]);
      return { partner, lastMessage, unreadCount };
    }),
  );

  conversations.sort(
    (a, b) => (b.lastMessage?.createdAt.getTime() ?? 0) - (a.lastMessage?.createdAt.getTime() ?? 0),
  );

  return NextResponse.json({ conversations: conversations.filter((row) => row.partner) });
}

/**
 * Sends a message inside an active pairing.
 *
 * Sending requires the pairing, not just the address: knowing someone's
 * identifier is not permission to write to them. The notification is recorded
 * in the same flow, with the message preview attached.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the message" }, { status: 422 });
  }

  const pairing = await db.mentorship.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { teacherId: user.id, studentId: parsed.data.receiverId },
        { studentId: user.id, teacherId: parsed.data.receiverId },
      ],
    },
    select: { id: true },
  });

  if (!pairing) {
    return NextResponse.json({ error: "You can only message your paired teacher or student" }, { status: 403 });
  }

  const message = await db.message.create({
    data: { senderId: user.id, receiverId: parsed.data.receiverId, content: parsed.data.content },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  await createNotification({
    userId: parsed.data.receiverId,
    type: "message",
    title: `New message from ${user.name}`,
    body: parsed.data.content.slice(0, 200),
    metadata: { senderId: user.id },
  });

  return NextResponse.json({ message }, { status: 201 });
}
