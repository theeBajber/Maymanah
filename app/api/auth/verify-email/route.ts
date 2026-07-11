import { prisma, safeQuery } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    const baseUrl = new URL(req.url).origin;

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/login?error=missing_token`);
    }

    const record = await safeQuery(() => prisma.verificationToken.findFirst({
      where: { token, expires: { gte: new Date() } },
    }));

    if (!record) {
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_or_expired_token`);
    }

    await safeQuery(() => prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }));

    await logAuditEvent({
      action: "EMAIL_VERIFIED",
      email: record.identifier,
    });

    await safeQuery(() => prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    }));

    return NextResponse.redirect(`${baseUrl}/login?verified=true`);
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(`${new URL((req as NextRequest).url).origin}/login?error=verification_failed`);
  }
}
