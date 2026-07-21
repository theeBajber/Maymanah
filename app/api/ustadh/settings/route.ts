import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.ustadhProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        isApproved: true,
        availableForTeaching: true,
      },
    });

    if (!profile) {
      return NextResponse.json({
        isApproved: false,
        availableForTeaching: false,
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ustadhId = session.user.id;
    const body = await req.json();
    const { availableForTeaching } = body;

    const profile = await prisma.ustadhProfile.upsert({
      where: { userId: ustadhId },
      create: {
        userId: ustadhId,
        availableForTeaching: availableForTeaching ?? false,
      },
      update: {
        ...(availableForTeaching !== undefined && { availableForTeaching }),
      },
      select: {
        availableForTeaching: true,
        isApproved: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
