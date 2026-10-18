import { createClient, E2E_COURSE_SLUG, E2E_EMAIL_PREFIX } from "./database";

/**
 * Removes everything the run created.
 *
 * Accounts cascade to their dependent rows in the schema, so deleting the
 * users and the seeded course is enough to leave the database as it started.
 */
export default async function globalTeardown(): Promise<void> {
  const db = createClient();

  try {
    await db.course.deleteMany({ where: { slug: E2E_COURSE_SLUG } });
    await db.user.deleteMany({ where: { email: { startsWith: E2E_EMAIL_PREFIX } } });
  } finally {
    await db.$disconnect();
  }
}
