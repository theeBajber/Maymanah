import { expect, test } from "@playwright/test";

import { E2E_PAIR_PASSWORD, E2E_PAIR_TEACHER_EMAIL } from "./database";
import { login } from "./helpers";

test("a teacher writes and resolves a note about a student", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/login");
  await login(page, E2E_PAIR_TEACHER_EMAIL, E2E_PAIR_PASSWORD);

  await page.goto("/students");
  await page.getByRole("link", { name: /Yusuf/ }).click();
  await page.waitForURL(/\/students\//, { timeout: 15_000 });

  await page.getByRole("button", { name: "Add note" }).click();
  await page
    .getByPlaceholder("Write a note about this student...")
    .fill("Revise Surah Al-Fatihah before the next session.");
  await page.getByRole("button", { name: "Save", exact: true }).click();

  await expect(page.getByText("Revise Surah Al-Fatihah before the next session.")).toBeVisible({
    timeout: 15_000,
  });

  await page.getByTitle("Resolve").click();
  await page.getByRole("button", { name: /Resolved notes/ }).click();
  await expect(page.getByText("Revise Surah Al-Fatihah before the next session.")).toBeVisible({
    timeout: 15_000,
  });
});
