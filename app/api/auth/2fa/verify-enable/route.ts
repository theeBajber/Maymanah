import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const limit = await rateLimit({ maxRequests: 5, windowMs: 60_000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otpCode } = await req.json();
    if (!otpCode) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled." },
        { status: 400 },
      );
    }

    const otpRecord = await prisma.twoFactorOTP.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No valid code found. Request a new one." },
        { status: 400 },
      );
    }

    const isValid = await bcrypt.compare(otpCode, otpRecord.code);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 },
      );
    }

    await prisma.twoFactorOTP.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    await logAuditEvent({
      action: "TWO_FACTOR_ENABLED",
      userId: user.id,
    });

    return NextResponse.json({ message: "Two-factor authentication enabled successfully." });
  } catch (error) {
    console.error("2FA verify-enable error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
