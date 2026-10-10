import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toMultiLine } from "@/lib/text";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const bookmarkSchema = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1),
  note: z.string().transform(toMultiLine).pipe(z.string().max(500)).optional(),
});

/** All saved verses, newest first. */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookmarks });
}

/**
 * Saves a verse, or updates the note on one already saved.
 *
 * Saving twice returns the row rather than duplicating it. Verse numbers are
 * accepted as given; validating all 6,236 against a chapter table belongs to
 * the Quran data phase, not to a bookmark.
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

  const parsed = bookmarkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Surah must be 1 to 114 with a verse number" }, { status: 422 });
  }

  const bookmark = await db.bookmark.upsert({
    where: { userId_surah_ayah: { userId: user.id, surah: parsed.data.surah, ayah: parsed.data.ayah } },
    create: { userId: user.id, surah: parsed.data.surah, ayah: parsed.data.ayah, note: parsed.data.note || null },
    update: { note: parsed.data.note || null },
  });

  return NextResponse.json({ ok: true, id: bookmark.id }, { status: 201 });
}

/** Removes a saved verse. */
export async function DELETE(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Say which bookmark to remove" }, { status: 422 });
  }

  const result = await db.bookmark.deleteMany({ where: { id, userId: user.id } });
  if (result.count === 0) {
    return NextResponse.json({ error: "That bookmark could not be found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
