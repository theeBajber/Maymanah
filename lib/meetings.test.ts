import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { decryptSecret, encryptSecret, normalizeMeetUrl } from "./meetings";

describe("normalizeMeetUrl", () => {
  it("accepts a plain lesson link", () => {
    expect(normalizeMeetUrl("https://meet.google.com/abc-defg-hij")).toBe(
      "https://meet.google.com/abc-defg-hij",
    );
  });

  it("trims surrounding whitespace from a pasted link", () => {
    expect(normalizeMeetUrl("  https://meet.google.com/abc-defg-hij  ")).toBe(
      "https://meet.google.com/abc-defg-hij",
    );
  });

  it("refuses insecure or foreign addresses", () => {
    expect(normalizeMeetUrl("http://meet.google.com/abc-defg-hij")).toBeNull();
    expect(normalizeMeetUrl("https://meet.google.com.evil.test/abc-defg-hij")).toBeNull();
    expect(normalizeMeetUrl("https://example.com/abc-defg-hij")).toBeNull();
  });

  it("refuses credentials, ports, queries, and fragments", () => {
    expect(normalizeMeetUrl("https://user:pass@meet.google.com/abc-defg-hij")).toBeNull();
    expect(normalizeMeetUrl("https://meet.google.com:8443/abc-defg-hij")).toBeNull();
    expect(normalizeMeetUrl("https://meet.google.com/abc-defg-hij?authuser=0")).toBeNull();
    expect(normalizeMeetUrl("https://meet.google.com/abc-defg-hij#x")).toBeNull();
  });

  it("refuses an address with no room path", () => {
    expect(normalizeMeetUrl("https://meet.google.com")).toBeNull();
    expect(normalizeMeetUrl("https://meet.google.com/")).toBeNull();
  });

  it("refuses text that is not a URL", () => {
    expect(normalizeMeetUrl("meet.google.com/abc-defg-hij")).toBeNull();
    expect(normalizeMeetUrl("not a link")).toBeNull();
    expect(normalizeMeetUrl("")).toBeNull();
  });
});

describe("meeting token encryption", () => {
  const key = randomBytes(32);

  it("round-trips a refresh token", () => {
    const token = "1//refresh-token-value";
    const sealed = encryptSecret(token, key);

    expect(sealed).not.toContain(token);
    expect(sealed.startsWith("v1.")).toBe(true);
    expect(decryptSecret(sealed, key)).toBe(token);
  });

  it("produces a different value each time", () => {
    expect(encryptSecret("same", key)).not.toBe(encryptSecret("same", key));
  });

  it("refuses a value changed in transit", () => {
    const sealed = encryptSecret("refresh-token", key);
    const parts = sealed.split(".");
    parts[3] = Buffer.from("tampered").toString("base64url");

    expect(() => decryptSecret(parts.join("."), key)).toThrow();
  });

  it("refuses a different key", () => {
    const sealed = encryptSecret("refresh-token", key);
    expect(() => decryptSecret(sealed, randomBytes(32))).toThrow();
  });
});
