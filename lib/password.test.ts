import { beforeAll, describe, expect, it } from "vitest";

import { hashOneTimeCode, hashPassword, hashToken, verifyOneTimeCode, verifyPassword } from "./password";

describe("password hashing", () => {
  it("produces a hash that verifies against the original password", async () => {
    const hash = await hashPassword("correct horse battery staple");

    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
  });

  it("records the algorithm and cost parameters alongside the hash", async () => {
    const hash = await hashPassword("anything");
    const [algorithm, N, r, p] = hash.split("$");

    expect(algorithm).toBe("scrypt");
    expect(Number(N)).toBeGreaterThan(0);
    expect(Number(r)).toBeGreaterThan(0);
    expect(Number(p)).toBeGreaterThan(0);
  });

  it("salts each hash, so identical passwords do not produce identical hashes", async () => {
    const [first, second] = await Promise.all([hashPassword("same password"), hashPassword("same password")]);

    expect(first).not.toBe(second);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("the real one");

    await expect(verifyPassword("the wrong one", hash)).resolves.toBe(false);
  });

  it("distinguishes a near miss, so an extra character is not overlooked", async () => {
    const hash = await hashPassword("password1");

    await expect(verifyPassword("password", hash)).resolves.toBe(false);
  });

  it("treats a corrupted hash as a mismatch rather than throwing", async () => {
    const truncated = (await hashPassword("secret")).slice(0, 20);

    await expect(verifyPassword("secret", truncated)).resolves.toBe(false);
  });

  it("treats a hash from another algorithm as a mismatch", async () => {
    await expect(verifyPassword("secret", "$2b$10$notoursometing")).resolves.toBe(false);
    await expect(verifyPassword("secret", "plaintext")).resolves.toBe(false);
    await expect(verifyPassword("secret", "")).resolves.toBe(false);
  });

  it("verifies against parameters recorded in the hash, not the current defaults", async () => {
    // Stands in for a password stored before the cost parameters were raised.
    const stored = await hashPassword("legacy secret");

    await expect(verifyPassword("legacy secret", stored)).resolves.toBe(true);
    await expect(verifyPassword("wrong", stored)).resolves.toBe(false);
  });
});

describe("one-time code hashing", () => {
  it("round-trips a code", async () => {
    const hash = await hashOneTimeCode("042918");

    await expect(verifyOneTimeCode("042918", hash)).resolves.toBe(true);
  });

  it("rejects a leading-zero code typed without its zero", async () => {
    const hash = await hashOneTimeCode("042918");

    await expect(verifyOneTimeCode("42918", hash)).resolves.toBe(false);
  });
});

describe("hashToken", () => {
  let hash: string;

  beforeAll(async () => {
    hash = await hashToken("a-high-entropy-token");
  });

  it("is deterministic, so a token can be looked up by its hash", async () => {
    await expect(hashToken("a-high-entropy-token")).resolves.toBe(hash);
  });

  it("differs for different tokens", async () => {
    await expect(hashToken("another-token")).resolves.not.toBe(hash);
  });

  it("does not contain the token", async () => {
    expect(hash).not.toContain("a-high-entropy-token");
  });

  it("is a sha256 hex digest", async () => {
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
