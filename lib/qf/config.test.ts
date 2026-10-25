import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getQuranConfig,
  QURAN_DEFAULTS,
  QuranConfigError,
} from "./config";

describe("getQuranConfig", () => {
  beforeEach(() => {
    vi.stubEnv("QF_ENV", "prelive");
    vi.stubEnv("QF_CLIENT_ID", "test-client-id");
    vi.stubEnv("QF_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("QF_AUTH_BASE_URL", "");
    vi.stubEnv("QF_CONTENT_BASE_URL", "");
    vi.stubEnv("QF_MEDIA_BASE_URL", "");
    vi.stubEnv("QF_REQUEST_TIMEOUT_MS", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses prelive endpoints by default", () => {
    expect(getQuranConfig()).toEqual({
      env: "prelive",
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authBaseUrl: "https://prelive-oauth2.quran.foundation",
      contentBaseUrl:
        "https://apis-prelive.quran.foundation/content/api/v4",
      mediaBaseUrl: "https://verses.quran.foundation",
      timeoutMs: 15_000,
    });
  });

  it("switches to production endpoints", () => {
    vi.stubEnv("QF_ENV", "production");

    expect(getQuranConfig()).toMatchObject({
      env: "production",
      authBaseUrl: "https://oauth2.quran.foundation",
      contentBaseUrl: "https://apis.quran.foundation/content/api/v4",
    });
  });

  it("allows base URL overrides and strips trailing slashes", () => {
    vi.stubEnv("QF_AUTH_BASE_URL", "https://auth.example.test///");
    vi.stubEnv("QF_CONTENT_BASE_URL", "https://content.example.test/v4/");
    vi.stubEnv("QF_MEDIA_BASE_URL", "https://media.example.test/");

    expect(getQuranConfig()).toMatchObject({
      authBaseUrl: "https://auth.example.test",
      contentBaseUrl: "https://content.example.test/v4",
      mediaBaseUrl: "https://media.example.test",
    });
  });

  it("clamps the timeout to a safe range", () => {
    vi.stubEnv("QF_REQUEST_TIMEOUT_MS", "10");
    expect(getQuranConfig().timeoutMs).toBe(1_000);

    vi.stubEnv("QF_REQUEST_TIMEOUT_MS", "999999");
    expect(getQuranConfig().timeoutMs).toBe(60_000);
  });

  it("names missing credentials without leaking values", () => {
    vi.stubEnv("QF_CLIENT_ID", "");
    vi.stubEnv("QF_CLIENT_SECRET", "");

    expect(() => getQuranConfig()).toThrowError(QuranConfigError);
    expect(() => getQuranConfig()).toThrow(
      "Missing Quran Foundation credentials: QF_CLIENT_ID, QF_CLIENT_SECRET.",
    );
  });

  it("rejects unknown environments and invalid timeouts", () => {
    vi.stubEnv("QF_ENV", "staging");
    expect(() => getQuranConfig()).toThrowError(QuranConfigError);

    vi.stubEnv("QF_ENV", "prelive");
    vi.stubEnv("QF_REQUEST_TIMEOUT_MS", "soon");
    expect(() => getQuranConfig()).toThrow(
      "QF_REQUEST_TIMEOUT_MS must be a number.",
    );
  });

  it("exposes stable reader defaults", () => {
    expect(QURAN_DEFAULTS).toEqual({
      mushafId: 1,
      translationId: 131,
      script: "uthmani",
      pageSize: 50,
    });
  });
});
