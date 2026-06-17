import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required for account deletion" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Password is incorrect" },
          { status: 401 }
        );
      }
    }

    // Delete user and all related data (cascading deletes will handle it)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      message: "Account deleted successfully",
      redirect: "/",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
