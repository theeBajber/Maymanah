import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SURAHS } from "@/lib/quran-meta";
import { getCurrentUser } from "@/lib/session";

/**
 * The surah table used by every range picker.
 *
 * Read from `surah_meta` rather than the bundled constant so the dropdowns and
 * the storage rules come from the same rows. The constant is only a fallback
 * for a database that has not finished seeding, which also keeps the endpoint
 * usable during a deployment.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });

  const rows = await db.surahMeta.findMany({
    orderBy: { number: "asc" },
    select: { number: true, name: true, ayahCount: true },
  });

  return NextResponse.json({ surahs: rows.length === SURAHS.length ? rows : SURAHS });
}
