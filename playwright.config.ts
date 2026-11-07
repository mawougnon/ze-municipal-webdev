import { defineConfig } from "@playwright/test";

// Needs a running server. Set E2E_BASE_URL to test another deployment.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    channel: "chrome",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
});
