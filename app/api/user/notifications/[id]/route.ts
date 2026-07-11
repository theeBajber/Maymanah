import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const notification = await safeQuery(() =>
      prisma.notification.findUnique({ where: { id } }),
    );

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await safeQuery(() =>
      prisma.notification.update({
        where: { id },
        data: { isRead: true },
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
