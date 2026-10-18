import { expect, test } from "@playwright/test";

import { E2E_COURSE_SLUG } from "./database";
import {
  expectStudentDashboard,
  registerAndLogin,
  strongPassword,
  uniqueEmail,
} from "./helpers";

test("a student registers, signs in, and reaches the dashboard", async ({ page }) => {
  const email = uniqueEmail("student");

  await registerAndLogin(page, {
    name: "Aisha Test",
    email,
    password: strongPassword(),
    role: "STUDENT",
  });

  await expectStudentDashboard(page);
});

test("a student browses the catalogue", async ({ page }) => {
  await registerAndLogin(page, {
    name: "Omar Browse",
    email: uniqueEmail("browse"),
    password: strongPassword(),
    role: "STUDENT",
  });

  await page.goto("/courses");
  await expect(page.getByRole("heading", { name: "Courses", exact: true })).toBeVisible();
  // The journey account has no enrolments yet, so the catalogue is the list on show.
  await expect(page.getByRole("heading", { name: "Available Courses" })).toBeVisible();
  await expect(page.getByRole("link", { name: /E2E Available Course/ })).toBeVisible();
});

test("a student enrols in a course", async ({ page }) => {
  await registerAndLogin(page, {
    name: "Safiya Enrol",
    email: uniqueEmail("enrol"),
    password: strongPassword(),
    role: "STUDENT",
  });

  await page.goto("/courses");
  await page.getByRole("link", { name: /E2E Available Course/ }).click();
  await page.waitForURL(new RegExp(`/courses/${E2E_COURSE_SLUG}`), { timeout: 15_000 });

  const enrolment = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/courses/${E2E_COURSE_SLUG}`) &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: /^Enrol now/ }).click();
  expect((await enrolment).ok()).toBeTruthy();

  await expect(page.getByRole("button", { name: "Leave course" })).toBeVisible({
    timeout: 15_000,
  });
});
