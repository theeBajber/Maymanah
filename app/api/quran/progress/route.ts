import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getJuzNumber } from "@/lib/quran";
import { getCurrentUser } from "@/lib/session";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const progressSchema = z.object({
  surah: z.number().int().min(1).max(114),
  verse: z.number().int().min(1),
});

/** Where the reader is: chapter, verse, and completed parts. */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const progress = await db.quranProgress.findUnique({ where: { userId: user.id } });

  return NextResponse.json({
    lastSurah: progress?.lastSurah ?? 1,
    lastVerse: progress?.lastVerse ?? 1,
    completedJuz: progress?.completedJuz ?? 0,
  });
}

/**
 * Records the furthest verse read.
 *
 * Only moves forward: reporting an earlier verse than the recorded one changes
 * nothing, since progress is a high-water mark rather than a log. Crossing
 * into a new part counts the finished one.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Surah must be 1 to 114 with a verse number" }, { status: 422 });
  }

  const { surah, verse } = parsed.data;

  const existing = await db.quranProgress.findUnique({ where: { userId: user.id } });

  if (existing) {
    const prevJuz = getJuzNumber(existing.lastSurah, existing.lastVerse);
    const nextJuz = getJuzNumber(surah, verse);
    const advanced = nextJuz > prevJuz || surah > existing.lastSurah || (surah === existing.lastSurah && verse > existing.lastVerse);

    if (!advanced) {
      return NextResponse.json({
        lastSurah: existing.lastSurah,
        lastVerse: existing.lastVerse,
        completedJuz: existing.completedJuz,
      });
    }

    const updated = await db.quranProgress.update({
      where: { userId: user.id },
      data: {
        lastSurah: surah,
        lastVerse: verse,
        completedJuz: Math.max(existing.completedJuz, nextJuz > prevJuz ? nextJuz - 1 : existing.completedJuz),
      },
    });

    return NextResponse.json({
      lastSurah: updated.lastSurah,
      lastVerse: updated.lastVerse,
      completedJuz: updated.completedJuz,
    });
  }

  const created = await db.quranProgress.create({
    data: { userId: user.id, lastSurah: surah, lastVerse: verse },
  });

  return NextResponse.json(
    { lastSurah: created.lastSurah, lastVerse: created.lastVerse, completedJuz: created.completedJuz },
    { status: 201 },
  );
}
