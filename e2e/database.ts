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

export function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
  });
}
