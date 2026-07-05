import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

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

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If the account exists, a verification email has been sent." },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified." },
      );
    }

    // Delete any existing tokens for this email
    const existingTokens = await prisma.verificationToken.findMany({
      where: { identifier: email },
      select: { token: true },
    });
    for (const t of existingTokens) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: t.token } },
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { message: "If the account exists, a verification email has been sent." },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
