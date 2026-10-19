import { expect, test } from "@playwright/test";

import { createClient, E2E_HIFDH_COURSE_SLUG, E2E_HIFDH_PASSWORD, E2E_HIFDH_STUDENT_EMAIL } from "./database";
import { login } from "./helpers";

/**
 * The Hifdh pairing journey.
 *
 * A student gives their hours, is matched with the seeded teacher, sees the
 * schedule and today's session, changes those hours, and — after a session is
 * moved outside them — ends the pairing to be matched again.
 */
test("a student is paired, scheduled, and can change mentor", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto("/login");
  await login(page, E2E_HIFDH_STUDENT_EMAIL, E2E_HIFDH_PASSWORD);

  await page.goto(`/courses/${E2E_HIFDH_COURSE_SLUG}`);
  await expect(page.getByRole("heading", { name: "Set Your Weekly Availability" })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByRole("button", { name: "Mon 09:00" }).click();
  await page.getByRole("button", { name: "Tue 09:00" }).click();
  await page.getByRole("button", { name: "Save & Find Teacher" }).click();
  await expect(page.getByRole("status").getByText(/paired with a teacher/)).toBeVisible({ timeout: 20_000 });

  // A fresh navigation confirms the pairing was stored, rather than leaning on
  // the client's own refresh timing.
  await page.reload();
  await expect(page.getByText(/Teacher:/)).toBeVisible({ timeout: 20_000 });

  // A forced session stands in for waiting until the slot's clock arrives.
  await page.goto(`/courses/${E2E_HIFDH_COURSE_SLUG}?test=1`);
  await expect(page.getByText("Today's Daily Session")).toBeVisible({ timeout: 20_000 });
  const forceStart = page.getByRole("button", { name: "Force Start" });
  if (await forceStart.count()) {
    await forceStart.click();
    await page.waitForURL(/\/session\//, { timeout: 20_000 });
  }

  // Change the weekly hours from inside the schedule.
  await page.goto(`/courses/${E2E_HIFDH_COURSE_SLUG}`);
  await page.getByRole("button", { name: "Change my weekly schedule" }).click();
  await page.getByRole("button", { name: "Wed 09:00" }).click();
  await page.getByRole("button", { name: "Save Schedule" }).click();
  await expect(page.getByText("Schedule updated!")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Weds at/)).toBeVisible({ timeout: 20_000 });

  // Move this week's session to another open time on the teacher's calendar.
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.getByRole("button", { name: "Reschedule this week" }).first().click();
  await expect(page.getByRole("heading", { name: "Reschedule Session" })).toBeVisible({ timeout: 20_000 });
  await page.locator('input[type="date"]').fill(tomorrow);
  const slot = page.getByRole("button", { name: /^\d{2}:\d{2}$/ }).first();
  await expect(slot).toBeVisible({ timeout: 20_000 });
  await slot.click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("Session rescheduled")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Reschedule Session" })).toBeHidden({ timeout: 20_000 });
  await page.waitForTimeout(1_500);

  // A session moved outside the student's hours raises the notice, and the
  // notice's "Find a new teacher" returns them to the availability grid.
  const db = createClient();
  try {
    const student = await db.user.findUnique({
      where: { email: E2E_HIFDH_STUDENT_EMAIL },
      select: { id: true },
    });
    await db.notification.create({
      data: {
        userId: student!.id,
        type: "session_rescheduled",
        title: "Session rescheduled",
        body: "Your teacher moved a session outside your availability.",
      },
    });
  } finally {
    await db.$disconnect();
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("Session time conflicts with your availability")).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Find a new teacher" }).click();
  await expect(page.getByRole("heading", { name: "Set Your Weekly Availability" })).toBeVisible({
    timeout: 20_000,
  });
});
