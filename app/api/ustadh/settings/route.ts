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
        ijazah: true,
        qiraah: true,
        availableForTeaching: true,
      },
    });

    if (!profile) {
      return NextResponse.json({
        isApproved: false,
        bio: null,
        qualifications: null,
        ijazah: null,
        qiraah: null,
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
    const { bio, qualifications, ijazah, qiraah, availableForTeaching } = body;

    if (bio !== undefined && typeof bio === "string" && bio.length > 500) {
      return NextResponse.json(
        { error: "Bio must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (
      qualifications !== undefined &&
      typeof qualifications === "string" &&
      qualifications.length > 1000
    ) {
      return NextResponse.json(
        { error: "Qualifications must be 1000 characters or less" },
        { status: 400 }
      );
    }

    if (
      ijazah !== undefined &&
      typeof ijazah === "string" &&
      ijazah.length > 1000
    ) {
      return NextResponse.json(
        { error: "Ijazah must be 1000 characters or less" },
        { status: 400 }
      );
    }

    if (
      qiraah !== undefined &&
      typeof qiraah === "string" &&
      qiraah.length > 500
    ) {
      return NextResponse.json(
        { error: "Qiraah must be 500 characters or less" },
        { status: 400 }
      );
    }

    const profile = await prisma.ustadhProfile.upsert({
      where: { userId: ustadhId },
      create: {
        userId: ustadhId,
        bio: bio ?? null,
        qualifications: qualifications ?? null,
        ijazah: ijazah ?? null,
        qiraah: qiraah ?? null,
        availableForTeaching: availableForTeaching ?? false,
      },
      update: {
        ...(bio !== undefined && { bio }),
        ...(qualifications !== undefined && { qualifications }),
        ...(ijazah !== undefined && { ijazah }),
        ...(qiraah !== undefined && { qiraah }),
        ...(availableForTeaching !== undefined && { availableForTeaching }),
      },
      select: {
        bio: true,
        qualifications: true,
        ijazah: true,
        qiraah: true,
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
