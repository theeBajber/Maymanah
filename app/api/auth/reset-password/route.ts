import { prisma, safeQuery } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { sendOTP } from "@/lib/email";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  otpCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const limit = await rateLimit({ maxRequests: 3, windowMs: 60_000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { token, password, otpCode } = parsed.data;

    const record = await safeQuery(() => prisma.verificationToken.findFirst({
      where: { token, expires: { gte: new Date() } },
    }));

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 },
      );
    }

    const user = await safeQuery(() => prisma.user.findUnique({
      where: { email: record.identifier },
      select: { id: true, email: true, twoFactorEnabled: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    if (user.twoFactorEnabled) {
      if (!otpCode) {
        const code = crypto.randomInt(100000, 999999).toString();
        const hashedCode = await bcrypt.hash(code, 10);

        await safeQuery(() => prisma.twoFactorOTP.create({
          data: {
            userId: user.id,
            code: hashedCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        }));

        await sendOTP(user.email!, code);

        return NextResponse.json(
          { error: "2FA_REQUIRED", email: user.email },
          { status: 400 },
        );
      }

      const otpRecord = await safeQuery(() => prisma.twoFactorOTP.findFirst({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      }));

      if (!otpRecord) {
        return NextResponse.json(
          { error: "No valid code found. Request a new one." },
          { status: 400 },
        );
      }

      const isValidOTP = await bcrypt.compare(otpCode, otpRecord.code);
      if (!isValidOTP) {
        return NextResponse.json(
          { error: "Invalid verification code." },
          { status: 400 },
        );
      }

      await safeQuery(() => prisma.twoFactorOTP.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await safeQuery(() => prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }));

    await safeQuery(() => prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    }));

    await logAuditEvent({
      action: "PASSWORD_RESET_COMPLETED",
      userId: user.id,
    });

    return NextResponse.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
