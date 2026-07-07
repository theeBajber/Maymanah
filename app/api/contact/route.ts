import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM = process.env.SMTP_FROM || "noreply@maymanah.com";
const TO = process.env.CONTACT_EMAIL || FROM;
const APP_NAME = "Maymanah";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 },
      );
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (typeof subject !== "string" || subject.trim().length < 2) {
      return NextResponse.json(
        { error: "Subject must be at least 2 characters." },
        { status: 400 },
      );
    }

    if (typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters." },
        { status: 400 },
      );
    }

    await transporter.sendMail({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `[Contact] ${subject.trim()} - ${APP_NAME}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:24px">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table style="max-width:480px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
      <tr><td style="padding:32px 24px 8px;text-align:center">
        <h1 style="font-size:22px;font-weight:800;margin:0;letter-spacing:1px">${APP_NAME}</h1>
      </td></tr>
      <tr><td style="padding:8px 24px 24px">
        <h2 style="font-size:18px;font-weight:600;margin:0 0 12px;color:#1a1a1a">New Contact Message</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;width:80px">Name</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${name.trim()}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${email.trim()}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Subject</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${subject.trim()}</td></tr>
        </table>
        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600">MESSAGE</p>
          <p style="margin:0;color:#1a1a1a;line-height:1.6;white-space:pre-wrap">${message.trim()}</p>
        </div>
      </td></tr>
      <tr><td style="padding:16px 24px;background:#fafafa;text-align:center;font-size:12px;color:#888">
        ${APP_NAME} &mdash; Quran Learning Platform
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}
