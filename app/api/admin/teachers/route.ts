import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError, getTeachers } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();
    const teachers = await getTeachers();
    return NextResponse.json(teachers);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin teachers fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
