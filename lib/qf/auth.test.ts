import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearQuranTokenCacheForTests,
  getQuranAccessToken,
  QuranAuthError,
} from "./auth";

function tokenResponse(token: string, expiresIn = 3_600): Response {
  return new Response(
    JSON.stringify({
      access_token: token,
      expires_in: expiresIn,
      token_type: "Bearer",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

describe("getQuranAccessToken", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("QF_ENV", "prelive");
    vi.stubEnv("QF_CLIENT_ID", "test-client-id");
    vi.stubEnv("QF_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("QF_AUTH_BASE_URL", "");
    vi.stubEnv("QF_CONTENT_BASE_URL", "");
    vi.stubEnv("QF_REQUEST_TIMEOUT_MS", "");
    vi.stubGlobal("fetch", fetchMock);
    clearQuranTokenCacheForTests();
    fetchMock.mockReset();
  });

  afterEach(() => {
    clearQuranTokenCacheForTests();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("requests and caches a content-scoped token", async () => {
    fetchMock.mockResolvedValue(tokenResponse("token-1"));

    await expect(getQuranAccessToken()).resolves.toBe("token-1");
    await expect(getQuranAccessToken()).resolves.toBe("token-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://prelive-oauth2.quran.foundation/oauth2/token",
    );
    expect(init.method).toBe("POST");

    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(
      `Basic ${Buffer.from("test-client-id:test-client-secret").toString("base64")}`,
    );
    expect(headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
    expect(String(init.body)).toBe(
      "grant_type=client_credentials&scope=content",
    );
  });

  it("single-flights concurrent token requests", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const first = getQuranAccessToken();
    const second = getQuranAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(tokenResponse("token-shared"));
    await expect(Promise.all([first, second])).resolves.toEqual([
      "token-shared",
      "token-shared",
    ]);
  });

  it("refreshes the token before expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    fetchMock
      .mockResolvedValueOnce(tokenResponse("token-1", 120))
      .mockResolvedValueOnce(tokenResponse("token-2", 120));

    await expect(getQuranAccessToken()).resolves.toBe("token-1");

    vi.advanceTimersByTime(61_000);

    await expect(getQuranAccessToken()).resolves.toBe("token-2");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("can force a refresh", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse("token-1"))
      .mockResolvedValueOnce(tokenResponse("token-2"));

    await expect(getQuranAccessToken()).resolves.toBe("token-1");
    await expect(
      getQuranAccessToken({ forceRefresh: true }),
    ).resolves.toBe("token-2");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws a sanitized auth error when the token request fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_client" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const error = await getQuranAccessToken().catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(QuranAuthError);
    expect((error as Error).message).not.toContain("test-client-secret");
  });

  it("rejects malformed token responses", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ access_token: "", expires_in: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(getQuranAccessToken()).rejects.toBeInstanceOf(
      QuranAuthError,
    );
  });
});
