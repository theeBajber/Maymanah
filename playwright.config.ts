import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end configuration.
 *
 * A single worker is used because the journeys share one database and create
 * accounts as they go; running them side by side would have them contend for
 * the same rate-limit and session rows. The dev server is started fresh with
 * TEST_MODE so the run never sends real mail or trips the throttles.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,

  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "firefox", use: { ...devices["Desktop Firefox"] } }],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TEST_MODE: "true", APP_URL: "http://localhost:3000" },
  },
});
