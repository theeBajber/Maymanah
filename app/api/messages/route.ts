import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const sendSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(5000),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get("userId");

    if (withUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: withUserId },
            { senderId: withUserId, receiverId: session.user.id },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      });

      return NextResponse.json({ messages });
    }

    const sentIds = await prisma.message.findMany({
      where: { senderId: session.user.id },
      select: { receiverId: true },
      distinct: ["receiverId"],
    });

    const receivedIds = await prisma.message.findMany({
      where: { receiverId: session.user.id },
      select: { senderId: true },
      distinct: ["senderId"],
    });

    const partnerIds = new Set([
      ...sentIds.map((m) => m.receiverId),
      ...receivedIds.map((m) => m.senderId),
    ]);

    const conversations = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: partnerId },
              { senderId: partnerId, receiverId: session.user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
          include: {
            sender: { select: { id: true, name: true, image: true } },
          },
        });

        const unreadCount = await prisma.message.count({
          where: { senderId: partnerId, receiverId: session.user.id, isRead: false },
        });

        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          select: { id: true, name: true, image: true },
        });

        return {
          partner,
          lastMessage,
          unreadCount,
        };
      }),
    );

    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt?.getTime() ?? 0;
      const bTime = b.lastMessage?.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { receiverId, content } = parsed.data;

    const mentorship = await prisma.mentorship.findFirst({
      where: {
        OR: [
          { teacherId: session.user.id, studentId: receiverId },
          { studentId: session.user.id, teacherId: receiverId },
        ],
        status: "ACTIVE",
      },
    });

    if (!mentorship) {
      return NextResponse.json({ error: "You can only message your paired mentor or student" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    await createNotification({
      userId: receiverId,
      type: "message",
      title: `New message from ${session.user.name || "your mentor"}`,
      body: content.slice(0, 200),
      metadata: { senderId: session.user.id } as Prisma.InputJsonValue,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
