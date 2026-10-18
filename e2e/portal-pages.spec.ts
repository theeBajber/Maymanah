import { expect, test } from "@playwright/test";

import { registerAndLogin, strongPassword, uniqueEmail } from "./helpers";

test("signed-out visitors are sent to sign in from account pages", async ({ page }) => {
  for (const path of ["/availability", "/students", "/revision", "/report"]) {
    await page.goto(path);
    await page.waitForURL(/\/login/, { timeout: 15_000 });
  }
});

test("a signed-in user can reach availability, students, revision, and report", async ({
  page,
}) => {
  await registerAndLogin(page, {
    name: "Ustadh Yusuf",
    email: uniqueEmail("pages"),
    password: strongPassword(),
    role: "TEACHER",
  });

  await page.goto("/availability");
  await expect(
    page.getByRole("heading", { name: "Weekly Availability", level: 1 }),
  ).toBeVisible();

  await page.goto("/students");
  await expect(page.getByRole("heading", { name: "My Students" })).toBeVisible();

  await page.goto("/revision");
  await expect(page.getByRole("heading", { name: "Quran Revision" })).toBeVisible();

  await page.goto("/report");
  await expect(page.getByRole("heading", { name: "Report an Issue" })).toBeVisible();
});
