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
        bio: true,
        qualifications: true,
      },
    });

    if (!profile) {
      return NextResponse.json({
        isApproved: false,
        bio: null,
        qualifications: null,
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
    const { bio, qualifications } = body;

    if (bio !== undefined && typeof bio === "string" && bio.length > 300) {
      return NextResponse.json(
        { error: "Bio must be 300 characters or less" },
        { status: 400 }
      );
    }

    if (
      qualifications !== undefined &&
      typeof qualifications === "string" &&
      qualifications.length > 500
    ) {
      return NextResponse.json(
        { error: "Qualifications must be 500 characters or less" },
        { status: 400 }
      );
    }

    const profile = await prisma.ustadhProfile.upsert({
      where: { userId: ustadhId },
      create: {
        userId: ustadhId,
        bio: bio ?? null,
        qualifications: qualifications ?? null,
      },
      update: {
        ...(bio !== undefined && { bio }),
        ...(qualifications !== undefined && { qualifications }),
      },
      select: {
        bio: true,
        qualifications: true,
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
