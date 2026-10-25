import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getQuranChapterAudio } from "@/lib/qf/cache";
import { quranErrorResponse } from "@/lib/qf/http";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; chapter: string }>;
};

const idSchema = z.coerce.number().int().min(1).max(10_000);
const chapterSchema = z.coerce.number().int().min(1).max(114);

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(await auth());
    if (!user) {
      return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
    }

    const { id, chapter } = await params;
    const recitationId = idSchema.safeParse(id);
    const chapterId = chapterSchema.safeParse(chapter);

    if (!recitationId.success || !chapterId.success) {
      return NextResponse.json(
        { error: "Invalid recitation or chapter" },
        { status: 400 },
      );
    }

    const audioFiles = await getQuranChapterAudio(
      recitationId.data,
      chapterId.data,
    );

    return NextResponse.json(
      { audioFiles },
      {
        headers: {
          "Cache-Control":
            "private, max-age=300, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    return quranErrorResponse(error, "Quran audio request failed");
  }
}
