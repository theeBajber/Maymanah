import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dashboardData = await getDashboardData(session.user.email);
    if (!dashboardData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
