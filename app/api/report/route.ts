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

const REASON_LABELS: Record<string, string> = {
  inappropriate: "Inappropriate behavior",
  harassment: "Harassment",
  spam: "Spam",
  fake: "Fake profile",
  other_reason: "Other",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      reportType,
      reportedUser,
      reason,
      url,
      description,
      reporterName,
      reporterEmail,
      reporterRole,
    } = body;

    if (!reportType || !["user", "technical", "other"].includes(reportType)) {
      return NextResponse.json(
        { error: "Invalid report type." },
        { status: 400 },
      );
    }

    if (reportType === "user" && (!reportedUser || reportedUser.trim().length < 2)) {
      return NextResponse.json(
        { error: "Please provide the name or ID of the user you're reporting." },
        { status: 400 },
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters." },
        { status: 400 },
      );
    }

    const typeLabel =
      reportType === "user"
        ? "Report a User"
        : reportType === "technical"
          ? "Technical Issue"
          : "Other";

    const reasonLabel = reason ? REASON_LABELS[reason] ?? reason : "";

    let detailsHtml = "";
    if (reportType === "user" && reportedUser) {
      detailsHtml += `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;width:100px">Reported User</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${reportedUser.trim()}</td></tr>`;
    }
    if (reasonLabel) {
      detailsHtml += `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Reason</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${reasonLabel}</td></tr>`;
    }
    if (url) {
      detailsHtml += `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">URL</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${url.trim()}</td></tr>`;
    }

    await transporter.sendMail({
      from: FROM,
      to: TO,
      replyTo: reporterEmail,
      subject: `[Report] ${typeLabel}${reasonLabel ? ` - ${reasonLabel}` : ""} - ${APP_NAME}`,
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
        <h2 style="font-size:18px;font-weight:600;margin:0 0 12px;color:#1a1a1a">New Report: ${typeLabel}</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;width:80px">Reporter</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${reporterName || "Unknown"}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${reporterEmail || "Unknown"}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Role</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px">${reporterRole || "Unknown"}</td></tr>
          ${detailsHtml}
        </table>
        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600">DESCRIPTION</p>
          <p style="margin:0;color:#1a1a1a;line-height:1.6;white-space:pre-wrap">${description.trim()}</p>
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
      { error: "Failed to submit report. Please try again later." },
      { status: 500 },
    );
  }
}
