const PORTRAIT_COUNT = 9;

/**
 * Deterministic per-user default avatar. Every user with no chosen portrait
 * used to render the exact same hardcoded image everywhere (mostly
 * pattern-6.png, with one inconsistent pattern-1.png fallback in the
 * leaderboard) — there was no per-user variation at all. This picks one of
 * the 9 stock portraits from a stable hash of a user identifier (id, or
 * email as a fallback seed), so the default looks distinct per user without
 * needing a DB write or migration — existing users with a null image get a
 * consistent-looking avatar immediately, computed the same way everywhere.
 */
export function defaultAvatar(seed: string | null | undefined): string {
  const key = seed || "maymanah";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PORTRAIT_COUNT;
  return `/portraits/pattern-${index + 1}.png`;
}
