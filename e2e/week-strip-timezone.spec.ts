import { expect, test } from "@playwright/test";

import { createClient, E2E_HIFDH_COURSE_SLUG, E2E_TZ_PASSWORD, E2E_TZ_STUDENT_EMAIL } from "./database";
import { login } from "./helpers";

test.use({ timezoneId: "Pacific/Auckland" });

/**
 * The week strip must group sessions by the browser's calendar day.
 *
 * The seeded session sits at 12:30 UTC tomorrow — an afternoon instant in UTC
 * and Nairobi, but past midnight in Auckland, which is always UTC+12 or +13.
 * A grouping built on the server clock or UTC getters would file the session
 * one day early; this run's browser lives in Auckland and must disagree with
 * both.
 */
test("the week strip groups a session by the viewer's calendar day", async ({ page }) => {
  test.setTimeout(120_000);

  // The raw instant is read from the database, so the assertion targets the
  // exact row the seed wrote rather than a re-derivation of it.
  const db = createClient();
  let startIso: string;
  try {
    const appointment = await db.appointment.findFirst({
      where: { mentorship: { student: { email: E2E_TZ_STUDENT_EMAIL } } },
      select: { startTime: true },
      orderBy: { startTime: "desc" },
    });
    startIso = appointment!.startTime.toISOString();
  } finally {
    await db.$disconnect();
  }

  await page.goto("/login");
  await login(page, E2E_TZ_STUDENT_EMAIL, E2E_TZ_PASSWORD);

  await page.goto(`/courses/${E2E_HIFDH_COURSE_SLUG}`);
  await expect(page.getByRole("heading", { name: "This week" })).toBeVisible({ timeout: 20_000 });

  // The day key format lives in the strip: Y-M-D in the viewer's zone, month
  // zero-based. Computing it inside the page keeps the test on Auckland time
  // even though the runner itself sits in another zone.
  const localKey = await page.evaluate((iso) => {
    const date = new Date(iso);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }, startIso);
  const utcKey = await page.evaluate((iso) => {
    const date = new Date(iso);
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  }, startIso);
  expect(localKey).not.toBe(utcKey);

  // The UTC day reads empty: the session must not have leaked into it.
  await expect(page.locator(`[data-day="${utcKey}"]`)).toHaveAttribute(
    "aria-label",
    /, no session$/,
  );

  // The Auckland day holds the row, keyed by the session's raw instant.
  await page.locator(`[data-day="${localKey}"]`).click();
  await expect(
    page.getByRole("dialog").locator(`li[data-start="${startIso}"]`),
  ).toBeVisible();
});
