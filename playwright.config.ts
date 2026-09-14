import { defineConfig, devices } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function clientOrigin(): string {
  const cfgPath =
    process.env.WL_CLIENT_CONFIG ??
    resolve("examples/client.config.example.json");
  if (existsSync(cfgPath)) {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8")) as {
      brand: { origin: string };
    };
    return process.env.E2E_BASE_URL ?? cfg.brand.origin;
  }
  return process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
}

const full = process.env.E2E_FULL === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: clientOrigin(),
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  grep: full ? undefined : /@smoke/,
});
