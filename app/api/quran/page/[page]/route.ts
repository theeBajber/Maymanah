import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getQuranPageData } from "@/lib/qf/cache";
import { quranErrorResponse } from "@/lib/qf/http";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  mushaf: z.coerce.number().int().min(1).max(100).default(1),
  translation: z.coerce.number().int().min(1).max(9_999).default(131),
  script: z.enum(["uthmani", "indopak", "tajweed"]).default("uthmani"),
});

type RouteContext = { params: Promise<{ page: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(await auth());
    if (!user) {
      return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
    }

    const { page: pageParam } = await params;
    const pageNumber = z.coerce
      .number()
      .int()
      .min(1)
      .max(1_000)
      .safeParse(pageParam);

    if (!pageNumber.success) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 },
      );
    }

    const query = querySchema.safeParse({
      mushaf: request.nextUrl.searchParams.get("mushaf") ?? undefined,
      translation:
        request.nextUrl.searchParams.get("translation") ?? undefined,
      script: request.nextUrl.searchParams.get("script") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.flatten() },
        { status: 400 },
      );
    }

    const page = await getQuranPageData({
      pageNumber: pageNumber.data,
      mushafId: query.data.mushaf,
      translationId: query.data.translation,
      script: query.data.script,
    });

    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return quranErrorResponse(error, "Quran page request failed");
  }
}
