import "server-only";

import { getQuranAccessToken } from "./auth";
import { getQuranConfig, type QuranConfig } from "./config";

export type QuranQueryValue = string | number | boolean | null | undefined;

export type QuranApiErrorCode =
  | "QF_NOT_FOUND"
  | "QF_RATE_LIMITED"
  | "QF_UNAUTHORIZED"
  | "QF_TIMEOUT"
  | "QF_UNAVAILABLE"
  | "QF_BAD_RESPONSE";

export class QuranApiError extends Error {
  readonly code: QuranApiErrorCode;
  readonly httpStatus: number;
  readonly retryAfterSeconds?: number;

  constructor(
    code: QuranApiErrorCode,
    message: string,
    httpStatus: number,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "QuranApiError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function buildQuranUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, QuranQueryValue>,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}${normalizedPath}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);

  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;

  return Math.max(0, Math.ceil((date - Date.now()) / 1_000));
}

async function performRequest(
  url: string,
  accessToken: string,
  config: QuranConfig,
): Promise<Response> {
  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-auth-token": accessToken,
        "x-client-id": config.clientId,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    throw new QuranApiError(
      timedOut ? "QF_TIMEOUT" : "QF_UNAVAILABLE",
      timedOut
        ? "Quran Foundation request timed out."
        : "Could not reach Quran Foundation.",
      timedOut ? 504 : 502,
    );
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    throw new QuranApiError(
      "QF_UNAUTHORIZED",
      "Quran Foundation rejected our API credentials.",
      502,
    );
  }

  if (response.status === 404) {
    throw new QuranApiError(
      "QF_NOT_FOUND",
      "The requested Quran resource was not found.",
      404,
    );
  }

  if (response.status === 429) {
    throw new QuranApiError(
      "QF_RATE_LIMITED",
      "Quran Foundation rate limit reached.",
      429,
      parseRetryAfter(response.headers.get("retry-after")),
    );
  }

  if (!response.ok) {
    throw new QuranApiError(
      "QF_UNAVAILABLE",
      `Quran Foundation returned status ${response.status}.`,
      502,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new QuranApiError(
      "QF_BAD_RESPONSE",
      "Quran Foundation returned an invalid JSON response.",
      502,
    );
  }
}

export async function quranFetch<T>(
  path: string,
  params?: Record<string, QuranQueryValue>,
): Promise<T> {
  const config = getQuranConfig();
  const url = buildQuranUrl(config.contentBaseUrl, path, params);
  const accessToken = await getQuranAccessToken();
  let response = await performRequest(url, accessToken, config);

  if (response.status === 401) {
    const refreshedToken = await getQuranAccessToken({ forceRefresh: true });
    response = await performRequest(url, refreshedToken, config);
  }

  return parseResponse<T>(response);
}
