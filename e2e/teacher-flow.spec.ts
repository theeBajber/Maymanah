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

  await expect(page.getByRole("heading", { name: "Weekly availability" })).toBeVisible({
    timeout: 15_000,
  });

  // Paint one half-hour on the same grid students use, then save it.
  await page.getByRole("button", { name: "Mon 09:00" }).click();

  const saved = page.waitForResponse(
    (response) =>
      response.url().includes("/api/availability") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Save availability" }).click();
  expect((await saved).ok()).toBeTruthy();

  await expect(page.getByText("Availability saved")).toBeVisible({ timeout: 15_000 });
});
