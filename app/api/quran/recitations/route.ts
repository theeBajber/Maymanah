import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getQuranRecitations } from "@/lib/qf/cache";
import { quranErrorResponse } from "@/lib/qf/http";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(await auth());
    if (!user) {
      return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
    }

    const recitations = await getQuranRecitations();

    return NextResponse.json(
      { recitations },
      {
        headers: {
          "Cache-Control":
            "private, max-age=300, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    return quranErrorResponse(error, "Quran recitation request failed");
  }
}
