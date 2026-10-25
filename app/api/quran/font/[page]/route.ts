import { NextResponse } from "next/server";
import { z } from "zod";

import { QCF_FONT_LAST_PAGE } from "@/lib/qf/qcf-font";

const FONT_BASE_URL =
  process.env.QF_FONT_BASE_URL ??
  "https://quran.com/fonts/quran/hafs/v2/woff2";

type RouteContext = { params: Promise<{ page: string }> };

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(QCF_FONT_LAST_PAGE)
    .safeParse((await params).page);

  if (!page.success) {
    return NextResponse.json({ error: "Invalid page" }, { status: 404 });
  }

  try {
    const response = await fetch(`${FONT_BASE_URL}/p${page.data}.woff2`, {
      next: { revalidate: 31_536_000 },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 });
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": "font/woff2",
        "Cache-Control":
          "public, max-age=31536000, immutable, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Font request failed" },
      { status: 502 },
    );
  }
}
