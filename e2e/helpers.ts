import { expect, type Page } from "@playwright/test";

import { E2E_EMAIL_PREFIX } from "./database";

/**
 * A run-wide stamp keeps each invocation's addresses apart.
 *
 * The suite leaves accounts behind until teardown, so a fixed address would
 * collide with a previous run that did not finish cleanly.
 */
const RUN = Date.now();

export function uniqueEmail(prefix = "student"): string {
  return `${E2E_EMAIL_PREFIX}${prefix}-${RUN}@test.maymanah.app`;
}

/** Satisfies the registration rules: length, upper, lower, and a digit. */
export function strongPassword(): string {
  return `Maymanah${RUN}Aa1`;
}

type Role = "STUDENT" | "TEACHER";

/**
 * Registers an account and stops on the confirmation screen.
 *
 * Email confirmation is not required to sign in, so the journey continues from
 * the login link rather than following the link in the message.
 */
export async function register(
  page: Page,
  options: { name: string; email: string; password: string; role: Role },
): Promise<void> {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Begin your journey" })).toBeVisible();

  await page
    .getByRole("radio", { name: options.role === "TEACHER" ? "Teacher" : "Learner" })
    .click();

  await page.locator("#name").fill(options.name);
  await page.locator("#email").fill(options.email);
  await page.locator("#password").fill(options.password);
  await page.locator("#repeat").fill(options.password);

  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible({
    timeout: 20_000,
  });
}

export async function goToLoginFromConfirmation(page: Page): Promise<void> {
  await page.getByRole("link", { name: "Go to Login" }).click();
  await page.waitForURL(/\/login/, { timeout: 15_000 });
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  await expect(page.getByRole("heading", { name: "Continue your journey" })).toBeVisible();

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
}

/** Registers, signs in, and lands on the dashboard for the given role. */
export async function registerAndLogin(
  page: Page,
  options: { name: string; email: string; password: string; role: Role },
): Promise<void> {
  await register(page, options);
  await goToLoginFromConfirmation(page);
  await login(page, options.email, options.password);
}

export async function expectStudentDashboard(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: /^Hey,/ })).toBeVisible({ timeout: 15_000 });
}

export async function expectTeacherDashboard(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: /^Hello, Ustad/ })).toBeVisible({
    timeout: 15_000,
  });
}
