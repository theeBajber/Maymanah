import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ noteId: string }> };

export async function PATCH(_req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { noteId } = await params;
    const ustadhId = session.user.id;

    const note = await prisma.studentNote.findFirst({
      where: { id: noteId, ustadhId },
    });

    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.studentNote.update({
      where: { id: noteId },
      data: { resolved: false, resolvedAt: null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error reopening note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
