import "server-only";

export type QuranEnvironment = "prelive" | "production";
export type QuranScript = "uthmani" | "indopak" | "tajweed";

export interface QuranConfig {
  env: QuranEnvironment;
  clientId: string;
  clientSecret: string;
  authBaseUrl: string;
  contentBaseUrl: string;
  mediaBaseUrl: string;
  timeoutMs: number;
}

export const QURAN_DEFAULTS = {
  mushafId: 1,
  translationId: 131,
  script: "uthmani" as const,
  pageSize: 50,
};

const ENVIRONMENTS: Record<
  QuranEnvironment,
  { authBaseUrl: string; contentBaseUrl: string }
> = {
  prelive: {
    authBaseUrl: "https://prelive-oauth2.quran.foundation",
    contentBaseUrl: "https://apis-prelive.quran.foundation/content/api/v4",
  },
  production: {
    authBaseUrl: "https://oauth2.quran.foundation",
    contentBaseUrl: "https://apis.quran.foundation/content/api/v4",
  },
};

const DEFAULT_MEDIA_BASE_URL = "https://verses.quran.foundation";
const DEFAULT_TIMEOUT_MS = 15_000;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 60_000;

export class QuranConfigError extends Error {
  readonly code = "QF_CONFIG";

  constructor(message: string) {
    super(message);
    this.name = "QuranConfigError";
  }
}

function cleanBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function readEnvironment(value: string | undefined): QuranEnvironment {
  const env = (value ?? "prelive").trim().toLowerCase();
  if (env !== "prelive" && env !== "production") {
    throw new QuranConfigError(
      `QF_ENV must be "prelive" or "production"; received "${env}".`,
    );
  }
  return env;
}

function readTimeout(value: string | undefined): number {
  if (!value) return DEFAULT_TIMEOUT_MS;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new QuranConfigError("QF_REQUEST_TIMEOUT_MS must be a number.");
  }

  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, Math.round(parsed)));
}

export function getQuranConfig(): QuranConfig {
  const env = readEnvironment(process.env.QF_ENV);
  const environment = ENVIRONMENTS[env];
  const clientId = process.env.QF_CLIENT_ID?.trim();
  const clientSecret = process.env.QF_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    const missing = [
      !clientId ? "QF_CLIENT_ID" : null,
      !clientSecret ? "QF_CLIENT_SECRET" : null,
    ].filter((key): key is string => key !== null);

    throw new QuranConfigError(
      `Missing Quran Foundation credentials: ${missing.join(", ")}.`,
    );
  }

  return {
    env,
    clientId,
    clientSecret,
    authBaseUrl: cleanBaseUrl(
      process.env.QF_AUTH_BASE_URL || environment.authBaseUrl,
    ),
    contentBaseUrl: cleanBaseUrl(
      process.env.QF_CONTENT_BASE_URL || environment.contentBaseUrl,
    ),
    mediaBaseUrl: cleanBaseUrl(
      process.env.QF_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL,
    ),
    timeoutMs: readTimeout(process.env.QF_REQUEST_TIMEOUT_MS),
  };
}
