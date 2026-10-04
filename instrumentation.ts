/**
 * Runs once when a server instance boots, before it accepts traffic.
 *
 * The purpose is to fail fast on a misconfigured deployment: a server that
 * cannot reach its database should refuse to start rather than accept
 * requests and return an error for each one. `env()` throws a message naming
 * every offending variable, so there is nothing to add here beyond refusing to
 * continue.
 *
 * This does not run during `next build`, which is why environment validation
 * in `lib/env.ts` is deferred rather than performed at import.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { env } = await import("./lib/env");
  env();
}
