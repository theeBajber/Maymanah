import "dotenv/config";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// The suite runs outside Next, so the WebSocket shim the driver needs has to be
// supplied here rather than inherited from the application runtime.
neonConfig.webSocketConstructor = ws;

/** The course the enrolment journey looks for. */
export const E2E_COURSE_SLUG = "e2e-available-course";

/** Every account the suite creates shares this prefix, so cleanup is exact. */
export const E2E_EMAIL_PREFIX = "e2e-";

/** A fixed teacher and student seeded as an active pairing for the notes journey. */
export const E2E_PAIR_TEACHER_EMAIL = "e2e-notes-teacher@test.maymanah.app";
export const E2E_PAIR_STUDENT_EMAIL = "e2e-notes-student@test.maymanah.app";
export const E2E_PAIR_PASSWORD = "MaymanahE2ENotes1";

/** The course the Hifdh pairing journey enrols in, and the accounts it uses. */
export const E2E_HIFDH_COURSE_SLUG = "hifdh-ul-quran";
export const E2E_HIFDH_TEACHER_EMAIL = "e2e-hifdh-teacher@test.maymanah.app";
export const E2E_HIFDH_STUDENT_EMAIL = "e2e-hifdh-student@test.maymanah.app";
export const E2E_HIFDH_PASSWORD = "MaymanahE2EHifdh1";

/**
 * Two students on either side of the Hifdh finish line.
 *
 * Short has 6,235 ayahs — one short of the whole Quran — and full has all
 * 6,236. The review route is the first gate past completion, so the pair
 * proves the boundary itself, not a rounded percentage.
 */
export const E2E_BOUNDARY_SHORT_EMAIL = "e2e-hifdh-short@test.maymanah.app";
export const E2E_BOUNDARY_FULL_EMAIL = "e2e-hifdh-full@test.maymanah.app";
export const E2E_BOUNDARY_PASSWORD = "MaymanahE2EBoundary1";

/**
 * A paired pair with one session at 12:30 UTC the next day.
 *
 * The instant lands on a different calendar date in Auckland than in UTC, so
 * the week strip must group it by the browser's clock.
 */
export const E2E_TZ_TEACHER_EMAIL = "e2e-tz-teacher@test.maymanah.app";
export const E2E_TZ_STUDENT_EMAIL = "e2e-tz-student@test.maymanah.app";
export const E2E_TZ_PASSWORD = "MaymanahE2ETimezone1";

export function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
  });
}
