import { expect, test } from "@playwright/test";

import {
  expectTeacherDashboard,
  registerAndLogin,
  strongPassword,
  uniqueEmail,
} from "./helpers";

test("a teacher registers, signs in, and sees the teacher dashboard", async ({ page }) => {
  await registerAndLogin(page, {
    name: "Ustadh Khalid",
    email: uniqueEmail("teacher"),
    password: strongPassword(),
    role: "TEACHER",
  });

  await expectTeacherDashboard(page);
});

test("a teacher sets weekly availability", async ({ page }) => {
  await registerAndLogin(page, {
    name: "Ustadh Ahmed",
    email: uniqueEmail("avail"),
    password: strongPassword(),
    role: "TEACHER",
  });

  await page.goto("/settings");
  await page.getByRole("button", { name: "Teacher" }).click();

  await expect(page.getByRole("heading", { name: "Weekly Availability" })).toBeVisible({
    timeout: 15_000,
  });

  // First day of the week; adding a single slot is enough to exercise the save.
  await page.getByRole("button", { name: "+ Add slot" }).first().click();

  const saved = page.waitForResponse(
    (response) =>
      response.url().includes("/api/availability") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Save Availability" }).click();
  expect((await saved).ok()).toBeTruthy();

  await expect(page.getByText("Availability saved")).toBeVisible({ timeout: 15_000 });
});
