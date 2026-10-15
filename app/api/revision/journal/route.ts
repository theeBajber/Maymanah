import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toMultiLine } from "@/lib/text";

function unauthorized() {
  return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
}

const entrySchema = z.object({
  surahNumber: z.number().int().min(1).max(114),
  fromVerse: z.number().int().min(1),
  toVerse: z.number().int().min(1),
  errors: z.array(z.string().max(500)).max(100).optional(),
  accuracy: z.number().min(0).max(100).optional(),
  duration: z.number().int().min(0).max(24 * 60 * 60).optional(),
});

/** The fifty most recent practice entries, newest first. */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) return unauthorized();

  const entries = await db.recitationJournal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ entries });
}

/**
 * Records one recitation practice.
 *
 * The end verse must not precede the start: a backwards range describes no
 * practice. Notes on errors are free text within a length bound, since what
 * was noticed varies too much to fit columns.
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

  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the entry" }, { status: 422 });
  }

  const { surahNumber, fromVerse, toVerse } = parsed.data;
  if (toVerse < fromVerse) {
    return NextResponse.json({ error: "The end verse cannot precede the start verse" }, { status: 422 });
  }

  const entry = await db.recitationJournal.create({
    data: {
      userId: user.id,
      surahNumber,
      fromVerse,
      toVerse,
      errors: (parsed.data.errors ?? []).map(toMultiLine),
      accuracy: parsed.data.accuracy ?? 0,
      duration: parsed.data.duration ?? 0,
    },
  });

  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
}
