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
  /**
   * Calendar-integration credentials. All three are optional: without them a
   * teacher simply uses a pasted meeting link, and no lesson stops working.
   */
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  /** Base64-encoded 32-byte key used to encrypt stored refresh tokens. */
  MEETING_TOKEN_KEY: z.string().min(1).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().default("587"),
  SMTP_SECURE: z
    .string()
    .transform((value) => value === "true")
    .default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().min(1).default("noreply@maymanah.org"),
  /** How long a reserved teaching seat waits for a timetable before lapsing. */
  MENTOR_RESERVATION_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  /** How long a paused student keeps their seat before it is released. */
  MENTOR_PAUSED_SEAT_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  /** How far back the attendance ladder looks when counting no-shows. */
  STANDING_WINDOW_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  /** No-shows in the window that produce a warning. */
  STANDING_WARN_THRESHOLD: z.coerce.number().int().min(1).max(100).default(2),
  /** No-shows that pause new bookings. */
  STANDING_PAUSE_THRESHOLD: z.coerce.number().int().min(1).max(100).default(3),
  /** No-shows that propose disabling the account. */
  STANDING_DISABLE_THRESHOLD: z.coerce.number().int().min(1).max(100).default(5),
  /**
   * Records every ladder decision without applying it. Intended for the first
   * cohort, so the thresholds can be checked against real attendance before
   * they affect anyone's account.
   */
  STANDING_SHADOW_MODE: z
    .string()
    .transform((value) => value === "true")
    .default(true),
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
