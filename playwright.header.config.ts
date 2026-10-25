import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "header-auth.spec.ts",
  workers: 1,
  expect: { timeout: 15000 },
  timeout: 90000,
  use: {
    baseURL: "http://127.0.0.1:3104",
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_EXECUTABLE_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  projects: [
    {
      name: "header-desktop",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    { name: "header-mobile", use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "node tests/fixtures/header-server.mjs",
    url: "http://127.0.0.1:3104/en/login",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
