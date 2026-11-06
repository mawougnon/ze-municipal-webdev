import { defineConfig } from "@playwright/test";

// Runs against a server that is already started. E2E_BASE_URL can point to any deployment:
// the public tests only read. See e2e/admin.spec.ts for the ones that write.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    // The Chrome already on the machine, so no browser has to be downloaded
    channel: "chrome",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
});
