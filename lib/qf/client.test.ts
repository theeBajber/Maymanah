import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getQuranAccessToken } from "./auth";
import {
  buildQuranUrl,
  quranFetch,
  QuranApiError,
} from "./client";

vi.mock("./auth", () => ({
  getQuranAccessToken: vi.fn(),
}));

const getTokenMock = vi.mocked(getQuranAccessToken);

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("quranFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("QF_ENV", "prelive");
    vi.stubEnv("QF_CLIENT_ID", "test-client-id");
    vi.stubEnv("QF_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("QF_AUTH_BASE_URL", "");
    vi.stubEnv("QF_CONTENT_BASE_URL", "");
    vi.stubEnv("QF_REQUEST_TIMEOUT_MS", "");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    getTokenMock.mockReset();
    getTokenMock.mockResolvedValue("token-1");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("builds encoded URLs and skips empty query values", () => {
    const url = buildQuranUrl(
      "https://example.test/content/api/v4/",
      "/verses/by_key/2:255",
      {
        language: "en",
        words: true,
        translations: null,
        page: undefined,
        per_page: 50,
      },
    );

    expect(url).toBe(
      "https://example.test/content/api/v4/verses/by_key/2:255?language=en&words=true&per_page=50",
    );
  });

  it("sends auth and client headers", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ chapters: [] }));

    await expect(
      quranFetch("/chapters", { language: "en" }),
    ).resolves.toEqual({ chapters: [] });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;

    expect(headers["x-auth-token"]).toBe("token-1");
    expect(headers["x-client-id"]).toBe("test-client-id");
  });

  it("refreshes the token once after an upstream 401", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ chapters: [] }));
    getTokenMock
      .mockResolvedValueOnce("token-1")
      .mockResolvedValueOnce("token-2");

    await expect(quranFetch("/chapters")).resolves.toEqual({
      chapters: [],
    });

    expect(getTokenMock).toHaveBeenNthCalledWith(1);
    expect(getTokenMock).toHaveBeenNthCalledWith(2, {
      forceRefresh: true,
    });

    const [, retryInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const retryHeaders = retryInit.headers as Record<string, string>;
    expect(retryHeaders["x-auth-token"]).toBe("token-2");
  });

  it("does not retry a second 401", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ error: "still-expired" }, 401));

    await expect(quranFetch("/chapters")).rejects.toMatchObject({
      code: "QF_UNAUTHORIZED",
      httpStatus: 502,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("maps 404 responses", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "not found" }, 404));

    await expect(quranFetch("/pages/999")).rejects.toMatchObject({
      code: "QF_NOT_FOUND",
      httpStatus: 404,
    });
  });

  it("maps rate limits and Retry-After", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "slow down" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "3",
        },
      }),
    );

    const error = await quranFetch("/chapters").catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(QuranApiError);
    expect(error).toMatchObject({
      code: "QF_RATE_LIMITED",
      httpStatus: 429,
      retryAfterSeconds: 3,
    });
  });

  it("maps timeouts", async () => {
    const timeout = new Error("request timed out");
    timeout.name = "TimeoutError";
    fetchMock.mockRejectedValue(timeout);

    await expect(quranFetch("/chapters")).rejects.toMatchObject({
      code: "QF_TIMEOUT",
      httpStatus: 504,
    });
  });

  it("maps invalid JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response("not-json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(quranFetch("/chapters")).rejects.toMatchObject({
      code: "QF_BAD_RESPONSE",
      httpStatus: 502,
    });
  });
});
