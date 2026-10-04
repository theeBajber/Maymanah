import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { env, resetEnvCache } from "./env";

const VALID_DATABASE_URL = "postgresql://user:password@host/dbname?sslmode=require";
const VALID_SECRET = "a".repeat(32);

const pristineEnv = { ...process.env };

function givenEnvironment(overrides: Record<string, string | undefined>): void {
  process.env = { ...pristineEnv };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  resetEnvCache();
}

beforeEach(() => {
  givenEnvironment({});
});

afterEach(() => {
  process.env = { ...pristineEnv };
  resetEnvCache();
});

describe("env", () => {
  it("returns the configuration when every variable is valid", () => {
    givenEnvironment({ DATABASE_URL: VALID_DATABASE_URL, AUTH_SECRET: VALID_SECRET });

    expect(env().DATABASE_URL).toBe(VALID_DATABASE_URL);
  });

  it("rejects a missing database url", () => {
    givenEnvironment({ DATABASE_URL: undefined, AUTH_SECRET: VALID_SECRET });

    expect(() => env()).toThrow(/DATABASE_URL/);
  });

  it("rejects a secret that is too short to be real", () => {
    givenEnvironment({ DATABASE_URL: VALID_DATABASE_URL, AUTH_SECRET: "placeholder" });

    expect(() => env()).toThrow(/at least 32 characters/);
  });

  it("rejects a database url that is not a connection string", () => {
    givenEnvironment({ DATABASE_URL: "not-a-url", AUTH_SECRET: VALID_SECRET });

    expect(() => env()).toThrow(/PostgreSQL connection string/);
  });

  it("reports every invalid variable at once, so a misconfiguration is fixed in one pass", () => {
    givenEnvironment({ DATABASE_URL: undefined, AUTH_SECRET: "short" });

    let message = "";
    try {
      env();
    } catch (error) {
      message = error instanceof Error ? error.message : "";
    }

    expect(message).toContain("DATABASE_URL");
    expect(message).toContain("AUTH_SECRET");
  });

  it("reads the environment once and reuses the result", () => {
    givenEnvironment({ DATABASE_URL: VALID_DATABASE_URL, AUTH_SECRET: VALID_SECRET });

    const first = env();
    process.env.DATABASE_URL = "postgresql://user:password@other/dbname";

    expect(env()).toBe(first);
  });

  it("re-reads the environment after the cache is reset", () => {
    givenEnvironment({ DATABASE_URL: VALID_DATABASE_URL, AUTH_SECRET: VALID_SECRET });
    env();

    const updated = "postgresql://user:password@other/dbname";
    process.env.DATABASE_URL = updated;
    resetEnvCache();

    expect(env().DATABASE_URL).toBe(updated);
  });
});
