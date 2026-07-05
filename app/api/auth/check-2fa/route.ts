import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const limit = await rateLimit({ maxRequests: 10, windowMs: 60_000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { twoFactorEnabled: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      emailVerified: !!user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Check 2FA error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
