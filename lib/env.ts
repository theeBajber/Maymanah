import { z } from "zod";

/**
 * Variables the application cannot start without.
 *
 * Feature-specific credentials (payment providers, transactional email, video,
 * object storage) are deliberately absent. Those are validated by the module
 * that owns them, when that feature is first used, so that a contributor
 * working on an unrelated area is not blocked by integrations they are not
 * touching.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine((value) => value.startsWith("postgres://") || value.startsWith("postgresql://"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters; generate one with `openssl rand -base64 32`"),
  /** Origin used to build links in transactional email. */
  APP_URL: z.url("APP_URL must be an absolute origin, for example https://maymanah.org").default("http://localhost:3000"),
  LIVEKIT_API_KEY: z.string().min(1, "LIVEKIT_API_KEY is required for video sessions").optional(),
  LIVEKIT_API_SECRET: z.string().min(1, "LIVEKIT_API_SECRET is required for video sessions").optional(),
  LIVEKIT_URL: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Reads and validates server environment variables.
 *
 * Validation is deferred until first access rather than running at import time.
 * A production build renders routes ahead of any deployment, so validating
 * eagerly would fail the build for a machine that legitimately has no database
 * configured. The first real request still cannot proceed without valid values.
 *
 * @throws {Error} If a variable is missing or malformed. The message names every
 * offending variable at once, rather than surfacing them one request at a time.
 */
export function env(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  cached = parsed.data;
  return cached;
}

/** For tests, which need to re-evaluate against a mutated `process.env`. */
export function resetEnvCache(): void {
  cached = undefined;
}
