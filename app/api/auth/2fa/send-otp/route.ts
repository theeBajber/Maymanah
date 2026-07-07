import { prisma, safeQuery } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTP } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const limit = await rateLimit({ maxRequests: 2, windowMs: 60_000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await safeQuery(() => prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, twoFactorEnabled: true },
    }));

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled for this account." },
        { status: 400 },
      );
    }

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

    return NextResponse.json({ message: "Verification code sent." });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
