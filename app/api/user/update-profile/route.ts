import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, image: true, profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.profile?.bio ?? "",
      phone: user.profile?.phone ?? "",
      country: user.profile?.country ?? "",
      timezone: user.profile?.timezone ?? "Africa/Nairobi",
      quranLevel: user.profile?.quranLevel ?? "beginner",
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, bio, phone, country, timezone, quranLevel, image, gender } =
      await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new email already exists
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const [updatedUser, updatedProfile] = await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(image && { image }),
          ...(gender !== undefined && { gender }),
        },
      }),
      prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          bio,
          phone,
          country,
          timezone,
          quranLevel,
        },
        update: {
          ...(bio !== undefined && { bio }),
          ...(phone !== undefined && { phone }),
          ...(country !== undefined && { country }),
          ...(timezone !== undefined && { timezone }),
          ...(quranLevel !== undefined && { quranLevel }),
        },
      }),
    ]);

    return NextResponse.json({
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
