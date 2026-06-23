const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  if (
    process.env.AUTH_SECRET &&
    process.env.AUTH_SECRET === "your-32-char-secret"
  ) {
    console.warn(
      "WARNING: AUTH_SECRET is still the placeholder value. Generate a real secret with: openssl rand -base64 32",
    );
  }

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
