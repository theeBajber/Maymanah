import { describe, expect, it } from "vitest";

import {
  loginSchema,
  newPasswordSchema,
  PASSWORD_MIN_LENGTH,
  registerSchema,
  requestPasswordResetSchema,
  verifyCodeSchema,
} from "./validation";

const valid = { name: "Amina Yusuf", email: "amina@example.com", password: "a quiet morning" };

function firstIssue(result: { error?: { issues: { message: string; path: PropertyKey[] }[] } }) {
  return result.error?.issues[0];
}

describe("registerSchema", () => {
  it("accepts a well formed registration", () => {
    expect(registerSchema.parse(valid)).toEqual(valid);
  });

  it("trims and collapses whitespace in the name", () => {
    expect(registerSchema.parse({ ...valid, name: "  Amina   Yusuf  " }).name).toBe("Amina Yusuf");
  });

  it("lowercases the address so casing cannot create a second account", () => {
    expect(registerSchema.parse({ ...valid, email: "  Amina@Example.COM " }).email).toBe("amina@example.com");
  });

  it("folds decomposed characters, so one person cannot register twice", () => {
    const decomposed = registerSchema.parse({ ...valid, name: "Amiña" });
    const composed = registerSchema.parse({ ...valid, name: "Amiña" });

    expect(decomposed.name).toBe(composed.name);
  });

  it("rejects an address with no local part", () => {
    expect(firstIssue(registerSchema.safeParse({ ...valid, email: "@example.com" }))?.message).toMatch(/valid email/i);
  });

  it("rejects an address with no domain", () => {
    expect(registerSchema.safeParse({ ...valid, email: "amina@" }).success).toBe(false);
  });

  it("rejects a name that is only whitespace", () => {
    expect(registerSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  it(`rejects a password under ${PASSWORD_MIN_LENGTH} characters`, () => {
    expect(registerSchema.safeParse({ ...valid, password: "a".repeat(PASSWORD_MIN_LENGTH - 1) }).success).toBe(false);
  });

  it(`accepts a password of exactly ${PASSWORD_MIN_LENGTH} characters`, () => {
    expect(registerSchema.safeParse({ ...valid, password: "a".repeat(PASSWORD_MIN_LENGTH) }).success).toBe(true);
  });

  it("accepts a passphrase without digits, capitals or symbols", () => {
    expect(registerSchema.safeParse({ ...valid, password: "correct horse battery" }).success).toBe(true);
  });

  it("rejects a password containing the email address", () => {
    const result = registerSchema.safeParse({ email: "amina@example.com", name: "Amina", password: "amina12345" });

    expect(firstIssue(result)?.message).toMatch(/does not contain your email/i);
  });

  it("rejects a breached password that satisfies the length rule", () => {
    const result = registerSchema.safeParse({ ...valid, password: "password1234" });

    expect(firstIssue(result)?.message).toMatch(/breached passwords/i);
  });

  it("ignores case when checking a breached password", () => {
    expect(registerSchema.safeParse({ ...valid, password: "PassWord1234" }).success).toBe(false);
  });

  it("reports every problem at once, rather than one per attempt", () => {
    const result = registerSchema.safeParse({ name: "A", email: "nope", password: "short" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.length).toBeGreaterThanOrEqual(3);
  });

  it("does not trim a password, because a leading space may be deliberate", () => {
    const withSpace = registerSchema.parse({ ...valid, password: " a quiet morning " });

    expect(withSpace.password).toBe(" a quiet morning ");
  });
});

describe("loginSchema", () => {
  const credentials = { email: "amina@example.com", password: "whatever12" };

  it("normalises the address the same way registration does", () => {
    expect(loginSchema.parse({ ...credentials, email: " AMINA@Example.com " }).email).toBe("amina@example.com");
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ ...credentials, password: "" }).success).toBe(false);
  });

  it("does not apply the registration length rule to an existing password", () => {
    // Someone who registered before the minimum was raised must still sign in.
    expect(loginSchema.safeParse({ ...credentials, password: "short" }).success).toBe(true);
  });

  it("accepts a six digit code when one is supplied", () => {
    expect(loginSchema.safeParse({ ...credentials, code: "042918" }).data?.code).toBe("042918");
  });

  it("rejects a code that is not six digits", () => {
    expect(loginSchema.safeParse({ ...credentials, code: "12345" }).success).toBe(false);
    expect(loginSchema.safeParse({ ...credentials, code: "abcdef" }).success).toBe(false);
  });

  it("treats the code as optional", () => {
    expect(loginSchema.parse(credentials).code).toBeUndefined();
  });
});

describe("requestPasswordResetSchema", () => {
  it("accepts a valid address", () => {
    expect(requestPasswordResetSchema.parse({ email: " Amina@Example.com " }).email).toBe("amina@example.com");
  });

  it("rejects anything that is not an address", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "not-an-address" }).success).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("enforces the same minimum as registration", () => {
    expect(newPasswordSchema.safeParse({ password: "a".repeat(PASSWORD_MIN_LENGTH - 1) }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "a".repeat(PASSWORD_MIN_LENGTH) }).success).toBe(true);
  });
});

describe("verifyCodeSchema", () => {
  it("accepts a padded six digit code", () => {
    expect(verifyCodeSchema.safeParse({ code: "000042" }).success).toBe(true);
  });

  it("rejects a code typed without its leading zero", () => {
    expect(verifyCodeSchema.safeParse({ code: "42" }).success).toBe(false);
  });
});
