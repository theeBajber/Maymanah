import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  quranLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  image: z.string().url().or(z.literal("")).optional(),
  gender: z.string().max(10).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, image: true, gender: true, profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      image: user.image,
      gender: user.gender ?? "",
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

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, bio, phone, country, timezone, quranLevel, image, gender } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 },
        );
      }
    }

    const [updatedUser, updatedProfile] = await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(image !== undefined && { image }),
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
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
