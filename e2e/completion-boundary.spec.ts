import { expect, test } from "@playwright/test";

import {
  E2E_BOUNDARY_FULL_EMAIL,
  E2E_BOUNDARY_PASSWORD,
  E2E_BOUNDARY_SHORT_EMAIL,
  E2E_HIFDH_COURSE_SLUG,
} from "./database";
import { login } from "./helpers";

/**
 * The Hifdh finish line is exact, not a rounded percentage.
 *
 * Completion is the whole Quran — 6,236 distinct ayahs. A student one ayah
 * short (6,235, which rounds to 100.0%) must still be refused a review, and
 * the student on the line must be let through to a certificate. The review
 * route is the first gate past completion, so these calls exercise the shared
 * rule a crafted request would meet.
 */
test.describe("Hifdh completion boundary", () => {
  test("6,235 ayahs is not finished: the review is refused", async ({ page }) => {
    await page.goto("/login");
    await login(page, E2E_BOUNDARY_SHORT_EMAIL, E2E_BOUNDARY_PASSWORD);

    const response = await page.request.post(`/api/courses/${E2E_HIFDH_COURSE_SLUG}/review`, {
      data: { rating: 5 },
    });
    expect(response.status()).toBe(403);
    expect((await response.json()).error).toMatch(/finish the course/i);
  });

  test("6,236 ayahs is finished: the review issues a certificate", async ({ page }) => {
    await page.goto("/login");
    await login(page, E2E_BOUNDARY_FULL_EMAIL, E2E_BOUNDARY_PASSWORD);

    const response = await page.request.post(`/api/courses/${E2E_HIFDH_COURSE_SLUG}/review`, {
      data: { rating: 5 },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.certificateId).toBeTruthy();
  });
});
