/**
 * Loaded before every test file.
 *
 * Supplies deterministic values for the variables `lib/env.ts` requires, so the
 * suite does not depend on a developer's local `.env` and never reaches the
 * network. Values are fixed placeholders, not credentials: unit tests must not
 * be able to touch a real database by accident.
 *
 * `env()` memoises its result, so this runs before any module reads it.
 *
 * NODE_ENV is not set here: Vitest already sets it to "test", and the type
 * definitions mark it read-only.
 */
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/maymanah_test";
process.env.AUTH_SECRET ??= "test-secret-not-used-for-any-real-purpose";
