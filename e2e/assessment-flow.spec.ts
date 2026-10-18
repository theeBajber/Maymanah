import { expect, test } from "@playwright/test";

import { E2E_COURSE_SLUG } from "./database";
import { registerAndLogin, strongPassword, uniqueEmail } from "./helpers";

test("a student sits the lesson quiz and the final exam", async ({ page }) => {
  test.setTimeout(120_000);

  await registerAndLogin(page, {
    name: "Yusuf Assess",
    email: uniqueEmail("assess"),
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
  await expect(page.getByRole("button", { name: "Leave course" })).toBeVisible({ timeout: 15_000 });

  const lessonLink = page.getByRole("link", { name: /First Lesson/ });
  await expect(lessonLink).toHaveAttribute("href", /\/lessons\//, { timeout: 15_000 });
  await lessonLink.click();
  await page.waitForURL(/\/lessons\//, { timeout: 15_000 });

  await expect(page.getByRole("heading", { name: "Check your understanding" })).toBeVisible();
  await page.getByRole("button", { name: "Start Quiz" }).click();
  await page.getByRole("button", { name: "Alif", exact: true }).click();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Passed!" })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText("Completed", { exact: true })).toBeVisible({ timeout: 15_000 });

  await page.goto(`/courses/${E2E_COURSE_SLUG}/exam`);
  await page.getByRole("button", { name: "Begin Exam" }).click();
  await page.getByRole("button", { name: "28", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Right to left", exact: true }).click();
  await page.getByRole("button", { name: "Submit Exam", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Passed!" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Your certificate has been issued.")).toBeVisible();

  await page.goto(`/courses/${E2E_COURSE_SLUG}`);
  await page.getByRole("link", { name: "View Certificate" }).click();
  await page.waitForURL(/\/certificates\//, { timeout: 15_000 });
  await expect(page.getByText("Certificate of completion")).toBeVisible();
  await expect(page.getByRole("link", { name: "Download PDF" })).toBeVisible();
});
