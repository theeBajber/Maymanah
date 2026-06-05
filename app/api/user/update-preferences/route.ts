import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      theme,
      language,
      quranFont,
      emailNotifications,
      studyReminders,
      reminderTime,
    } = await req.json();

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
      { status: 500 }
    );
  }
}
