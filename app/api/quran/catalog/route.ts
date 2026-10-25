import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getQuranCatalog } from "@/lib/qf/cache";
import { quranErrorResponse } from "@/lib/qf/http";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser(await auth());
    if (!user) {
      return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
    }

    const catalog = await getQuranCatalog();

    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return quranErrorResponse(error, "Quran catalog request failed");
  }
}
