import { defineConfig } from "@playwright/test";
const base = {
  baseURL: "http://127.0.0.1:3100",
  headless: true,
  actionTimeout: 15000,
  navigationTimeout: 30000,
  launchOptions: {
    executablePath:
      process.env.PLAYWRIGHT_EXECUTABLE_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  },
};
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 120000,
  use: base,
  projects: [
    {
      name: "state-desktop",
      testMatch: "state-geography.spec.ts",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "state-mobile",
      testMatch: "state-geography.spec.ts",
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: "compact-desktop",
      testMatch: "compact-header.spec.ts",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "compact-mobile",
      testMatch: "compact-header.spec.ts",
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: "auth-desktop",
      testMatch: "auth-design.spec.ts",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "auth-mobile",
      testMatch: "auth-design.spec.ts",
      use: { viewport: { width: 390, height: 844 } },
    },
    ...[375, 390, 430, 768, 1024, 1440, 1920].map((width) => ({
      name: `responsive-${width}`,
      testMatch: "responsive.spec.ts",
      use: { viewport: { width, height: width < 761 ? 844 : 1000 } },
    })),
    {
      name: "desktop-flows",
      testMatch: "flows.spec.ts",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-flows",
      testMatch: "flows.spec.ts",
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: "desktop-a11y",
      testMatch: "accessibility.spec.ts",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-a11y",
      testMatch: "accessibility.spec.ts",
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/en",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
