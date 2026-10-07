import "server-only";

import { db } from "./db";

/**
 * The leaderboard around one user.
 *
 * Orders students by XP, then by seniority, and returns a five-row window
 * centred on the reader where possible, so a person far down the list still
 * sees themselves rather than only the top five. Rank is one-indexed: the
 * count of everyone strictly ahead, plus one.
 */
export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string | null;
  xp: number;
  image: string | null;
  currentUser: boolean;
}

const WINDOW_SIZE = 5;

export async function leaderboardAround(userId: string): Promise<{ rows: LeaderboardRow[]; rank: number | null }> {
  const me = await db.user.findUnique({ where: { id: userId }, select: { xp: true, createdAt: true } });
  if (!me) return { rows: [], rank: null };

  const ahead = await db.user.count({
    where: {
      role: "STUDENT",
      OR: [{ xp: { gt: me.xp } }, { xp: me.xp, createdAt: { lt: me.createdAt } }],
    },
  });
  const rank = ahead + 1;

  const start = Math.max(0, rank - 1 - Math.floor(WINDOW_SIZE / 2));

  const rows = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    skip: start,
    take: WINDOW_SIZE,
    select: { id: true, name: true, xp: true, image: true },
  });

  return {
    rows: rows.map((row, offset) => ({
      rank: start + offset + 1,
      userId: row.id,
      name: row.name,
      xp: row.xp,
      image: row.image,
      currentUser: row.id === userId,
    })),
    rank,
  };
}
