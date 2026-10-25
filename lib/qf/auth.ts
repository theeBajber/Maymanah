import "server-only";

import { getQuranConfig, type QuranConfig } from "./config";

const REFRESH_EARLY_MS = 60_000;

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

interface QfTokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
}

export class QuranAuthError extends Error {
  readonly code = "QF_AUTH";

  constructor(message = "Quran Foundation authentication is unavailable.") {
    super(message);
    this.name = "QuranAuthError";
  }
}

const tokenCache = new Map<string, CachedToken>();
const inFlightTokens = new Map<string, Promise<string>>();

function cacheKey(config: QuranConfig): string {
  return `${config.authBaseUrl}|${config.clientId}`;
}

async function requestToken(config: QuranConfig): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${config.authBaseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.clientId}:${config.clientSecret}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials&scope=content",
      cache: "no-store",
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch {
    throw new QuranAuthError(
      "Could not reach Quran Foundation authentication.",
    );
  }

  if (!response.ok) {
    throw new QuranAuthError(
      "Quran Foundation rejected the API credentials.",
    );
  }

  let body: QfTokenResponse;
  try {
    body = (await response.json()) as QfTokenResponse;
  } catch {
    throw new QuranAuthError(
      "Quran Foundation returned an invalid token response.",
    );
  }

  const accessToken =
    typeof body.access_token === "string" ? body.access_token : "";
  const expiresIn =
    typeof body.expires_in === "number" && Number.isFinite(body.expires_in)
      ? body.expires_in
      : 0;

  if (!accessToken || expiresIn <= 0) {
    throw new QuranAuthError(
      "Quran Foundation returned an invalid token response.",
    );
  }

  tokenCache.set(cacheKey(config), {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1_000,
  });

  return accessToken;
}

export async function getQuranAccessToken(options?: {
  forceRefresh?: boolean;
}): Promise<string> {
  const config = getQuranConfig();
  const key = cacheKey(config);
  const cached = tokenCache.get(key);

  if (
    !options?.forceRefresh &&
    cached &&
    cached.expiresAt > Date.now() + REFRESH_EARLY_MS
  ) {
    return cached.accessToken;
  }

  if (!options?.forceRefresh) {
    const pending = inFlightTokens.get(key);
    if (pending) return pending;
  }

  const pending = requestToken(config).finally(() => {
    if (inFlightTokens.get(key) === pending) {
      inFlightTokens.delete(key);
    }
  });

  inFlightTokens.set(key, pending);
  return pending;
}

export function clearQuranTokenCacheForTests(): void {
  tokenCache.clear();
  inFlightTokens.clear();
}
