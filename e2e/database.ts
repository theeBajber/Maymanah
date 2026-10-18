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

export function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
  });
}
