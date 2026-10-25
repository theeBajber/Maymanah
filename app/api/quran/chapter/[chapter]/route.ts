import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getQuranChapterPages } from "@/lib/qf/cache";
import { quranErrorResponse } from "@/lib/qf/http";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  mushaf: z.coerce.number().int().min(1).max(100).default(1),
  translation: z.coerce.number().int().min(1).max(9_999).default(131),
});

type RouteContext = { params: Promise<{ chapter: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(await auth());
    if (!user) {
      return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
    }

    const { chapter: chapterParam } = await params;
    const chapterId = z.coerce
      .number()
      .int()
      .min(1)
      .max(114)
      .safeParse(chapterParam);

    if (!chapterId.success) {
      return NextResponse.json(
        { error: "Invalid chapter number" },
        { status: 400 },
      );
    }

    const query = querySchema.safeParse({
      mushaf: request.nextUrl.searchParams.get("mushaf") ?? undefined,
      translation:
        request.nextUrl.searchParams.get("translation") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.flatten() },
        { status: 400 },
      );
    }

    const pages = await getQuranChapterPages(
      chapterId.data,
      query.data.mushaf,
      query.data.translation,
    );

    return NextResponse.json(
      {
        pages: pages.map((page) => ({
          ...page,
          verses: page.verses.map((verse) => ({
            ...verse,
            translations: [],
          })),
        })),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    return quranErrorResponse(error, "Quran chapter request failed");
  }
}
