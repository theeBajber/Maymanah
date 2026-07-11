import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type NotificationType = "session_reminder" | "message" | "note_added" | "session_rescheduled" | "mentorship_paired";

export async function createNotification({
  userId,
  type,
  title,
  body,
  metadata,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, metadata: metadata ?? {} },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function sendSessionReminderEmail(
  email: string,
  name: string,
  sessionType: string,
  startTime: Date,
  meetingUrl: string | null,
) {
  try {
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });

    const APP_NAME = "Maymanah";
    const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@maymanah.com",
      to: email,
      subject: `📚 ${sessionType} Session Reminder — ${APP_NAME}`,
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;padding:24px">
          <div style="text-align:center;margin-bottom:24px">
            <h1 style="font-size:22px;margin:0;color:#8B5CF6">${APP_NAME}</h1>
          </div>
          <p style="font-size:16px;line-height:1.5">Assalamu Alaykum ${name},</p>
          <p style="font-size:14px;line-height:1.6;color:#555">
            Your <strong>${sessionType}</strong> session is coming up soon.
          </p>
          <div style="background:#f5f3ff;border-radius:12px;padding:16px;margin:16px 0">
            <p style="margin:0 0 4px;font-size:13px;color:#666">Scheduled time</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#1a1a1a">
              ${startTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          ${meetingUrl ? `
            <a href="${meetingUrl}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;margin:8px 0">
              Join Session
            </a>
          ` : `
            <a href="${BASE_URL}/courses/hifdh-ul-quran" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;margin:8px 0">
              Go to Course
            </a>
          `}
          <p style="font-size:12px;color:#999;margin-top:24px;padding-top:16px;border-top:1px solid #eee">
            This is an automated reminder from ${APP_NAME}.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send session reminder email:", error);
  }
}
