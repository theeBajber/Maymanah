import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["en", "ar"]).optional(),
  quranFont: z.string().max(50).optional(),
  emailNotifications: z.boolean().optional(),
  studyReminders: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Reminder time must be in HH:MM format")
    .optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        profile: {
          select: {
            emailNotifications: true,
            studyReminders: true,
            reminderTime: true,
            language: true,
            quranFont: true,
            theme: true,
          },
        },
      },
    });

    return NextResponse.json({
      emailNotifications: user?.profile?.emailNotifications ?? true,
      studyReminders: user?.profile?.studyReminders ?? true,
      reminderTime: user?.profile?.reminderTime ?? "09:00",
      language: user?.profile?.language ?? "en",
      quranFont: user?.profile?.quranFont ?? "default",
      theme: user?.profile?.theme ?? "light",
    });
  } catch (error) {
    console.error("Fetch preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updatePreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      theme,
      language,
      quranFont,
      emailNotifications,
      studyReminders,
      reminderTime,
    } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...(theme && { theme }),
        ...(language && { language }),
        ...(quranFont && { quranFont }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(studyReminders !== undefined && { studyReminders }),
        ...(reminderTime && { reminderTime }),
      },
      update: {
        ...(theme && { theme }),
        ...(language && { language }),
        ...(quranFont && { quranFont }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(studyReminders !== undefined && { studyReminders }),
        ...(reminderTime && { reminderTime }),
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
