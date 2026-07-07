import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markMissedAppointments, getReliabilityScore } from "@/lib/mentorship";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markMissedAppointments();
    const score = await getReliabilityScore(session.user.id);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error fetching reliability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
