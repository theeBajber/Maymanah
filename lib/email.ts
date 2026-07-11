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
const APP_NAME = "Maymanah";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

function htmlWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:24px">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table style="max-width:480px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
      <tr><td style="padding:32px 24px 8px;text-align:center">
        <h1 style="font-size:22px;font-weight:800;margin:0;letter-spacing:1px">${APP_NAME}</h1>
      </td></tr>
      <tr><td style="padding:8px 24px 24px">
        <h2 style="font-size:18px;font-weight:600;margin:0 0 12px;color:#1a1a1a">${title}</h2>
        ${body}
      </td></tr>
      <tr><td style="padding:16px 24px;background:#fafafa;text-align:center;font-size:12px;color:#888">
        ${APP_NAME} &mdash; Quran Learning Platform
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Verify your email - ${APP_NAME}`,
    html: htmlWrapper(
      "Verify your email",
      `<p style="margin:0 0 16px;color:#555;line-height:1.6">Thanks for signing up! Click the button below to verify your email address.</p>
      <table cellpadding="0" cellspacing="0"><tr><td>
        <a href="${link}" style="display:inline-block;padding:12px 32px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Verify Email</a>
      </td></tr></table>
      <p style="margin:16px 0 0;font-size:13px;color:#999">Or copy this link: <br><span style="color:#555;word-break:break-all">${link}</span></p>
      <p style="margin:16px 0 0;font-size:13px;color:#999">This link expires in 24 hours.</p>`,
    ),
  });
}

export async function sendOTP(to: string, code: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your verification code - ${APP_NAME}`,
    html: htmlWrapper(
      "Your verification code",
      `<p style="margin:0 0 20px;color:#555;line-height:1.6">Use the code below to complete your action. It expires in 10 minutes.</p>
      <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
        <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#16a34a">${code}</span>
      </div>
      <p style="margin:20px 0 0;font-size:13px;color:#999">If you didn't request this code, you can safely ignore this email.</p>`,
    ),
  });
}

export async function sendTeacherRejectionEmail(to: string, name: string, reason?: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Teacher Application Update - ${APP_NAME}`,
    html: htmlWrapper(
      "Teacher Application Status",
      `<p style="margin:0 0 16px;color:#555;line-height:1.6">Assalamu Alaikum ${name},</p>
      <p style="margin:0 0 16px;color:#555;line-height:1.6">Thank you for your interest in becoming a teacher on ${APP_NAME}. After careful review, we regret to inform you that your application has not been approved at this time.</p>
      ${reason ? `<p style="margin:0 0 16px;color:#555;line-height:1.6"><strong>Reason:</strong> ${reason}</p>` : ""}
      <p style="margin:0 0 16px;color:#555;line-height:1.6">You are welcome to reapply in the future. If you have any questions, please contact our support team.</p>
      <p style="margin:0;color:#555;line-height:1.6">Jazak Allah Khair,<br/>The ${APP_NAME} Team</p>`,
    ),
  });
}

export async function sendTeacherApprovalEmail(to: string, name: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Teacher Application Approved - ${APP_NAME}`,
    html: htmlWrapper(
      "Welcome to the Teaching Team!",
      `<p style="margin:0 0 16px;color:#555;line-height:1.6">Assalamu Alaikum ${name},</p>
      <p style="margin:0 0 16px;color:#555;line-height:1.6">We are pleased to inform you that your teacher application has been <strong>approved</strong>! You can now log in and start managing your students and sessions.</p>
      <table cellpadding="0" cellspacing="0"><tr><td>
        <a href="${BASE_URL}/dashboard" style="display:inline-block;padding:12px 32px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Go to Dashboard</a>
      </td></tr></table>
      <p style="margin:16px 0 0;color:#555;line-height:1.6">Jazak Allah Khair,<br/>The ${APP_NAME} Team</p>`,
    ),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Reset your password - ${APP_NAME}`,
    html: htmlWrapper(
      "Reset your password",
      `<p style="margin:0 0 16px;color:#555;line-height:1.6">Click the button below to reset your password. This link expires in 1 hour.</p>
      <table cellpadding="0" cellspacing="0"><tr><td>
        <a href="${link}" style="display:inline-block;padding:12px 32px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Reset Password</a>
      </td></tr></table>
      <p style="margin:16px 0 0;font-size:13px;color:#999">Or copy this link: <br><span style="color:#555;word-break:break-all">${link}</span></p>
      <p style="margin:16px 0 0;font-size:13px;color:#999">If you didn't request this, you can safely ignore this email.</p>`,
    ),
  });
}
