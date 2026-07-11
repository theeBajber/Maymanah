import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification, sendSessionReminderEmail } from "@/lib/notifications";
import { markMissedAppointments } from "@/lib/mentorship";

export const maxDuration = 60;

export async function GET() {
  try {
    if (process.env.CRON_SECRET && process.env.CRON_SECRET !== "") {
      const authHeader = "_"; // Optional: check headers if needed
    }

    await markMissedAppointments();

    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const in15Min = new Date(now.getTime() + 15 * 60 * 1000);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        startTime: { gte: now, lte: inOneHour },
        joinedAt: null,
      },
      include: {
        teacher: { select: { id: true, email: true, name: true, profile: { select: { emailNotifications: true } } } },
        mentorship: {
          include: {
            student: { select: { id: true, email: true, name: true, profile: { select: { emailNotifications: true } } } },
          },
        },
      },
    });

    let remindersSent = 0;

    for (const apt of upcomingAppointments) {
      const isSoon = apt.startTime <= in15Min;
      const sessionLabel = apt.sessionType === "DAILY_HIFDH" ? "Hifdh" : apt.sessionType === "MURAJA" ? "Muraja'ah" : "Session";

      await createNotification({
        userId: apt.teacherId,
        type: "session_reminder",
        title: `${sessionLabel} session starting ${isSoon ? "soon" : "in about an hour"}`,
        body: `${apt.title || sessionLabel} at ${apt.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
        metadata: { appointmentId: apt.id },
      });

      await createNotification({
        userId: apt.mentorship.student.id,
        type: "session_reminder",
        title: `${sessionLabel} session starting ${isSoon ? "soon" : "in about an hour"}`,
        body: `${apt.title || sessionLabel} with ${apt.teacher.name || "your teacher"} at ${apt.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
        metadata: { appointmentId: apt.id },
      });

      if (apt.teacher.email && apt.teacher.profile?.emailNotifications) {
        await sendSessionReminderEmail(
          apt.teacher.email,
          apt.teacher.name || "Teacher",
          sessionLabel,
          apt.startTime,
          apt.meetingUrl,
        );
      }

      if (apt.mentorship.student.email && apt.mentorship.student.profile?.emailNotifications) {
        await sendSessionReminderEmail(
          apt.mentorship.student.email,
          apt.mentorship.student.name || "Student",
          sessionLabel,
          apt.startTime,
          apt.meetingUrl,
        );
      }

      remindersSent++;
    }

    return NextResponse.json({ success: true, missedMarked: true, remindersSent });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
