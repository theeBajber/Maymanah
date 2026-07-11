import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const limit = await rateLimit({ maxRequests: 3, windowMs: 60_000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const user = await safeQuery(() => prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    }));

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    await safeQuery(() => prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false },
    }));

    await logAuditEvent({
      action: "TWO_FACTOR_DISABLED",
      userId: user.id,
    });

    return NextResponse.json({ message: "Two-factor authentication disabled." });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
