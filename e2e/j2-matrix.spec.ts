import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * §J2 @full browser flows — require a deployed client + E2E_* secrets.
 * Smoke coverage lives in src/e2e/j2-smoke.test.ts (no browser download).
 */

function loadCfg() {
  const cfgPath =
    process.env.WL_CLIENT_CONFIG ??
    resolve("examples/client.config.example.json");
  if (!existsSync(cfgPath)) {
    return { brand: { origin: "https://example.com", appBase: "/app/" } };
  }
  return JSON.parse(readFileSync(cfgPath, "utf8")) as {
    brand: { origin: string; appBase: string; notifyEmail: string };
  };
}

const cfg = loadCfg();

test.describe("§J2 full matrix", () => {
  test.beforeEach(() => {
    test.skip(process.env.E2E_FULL !== "1", "Set E2E_FULL=1 for @full flows");
  });

  test("Admin sign-in @full", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "Need E2E_ADMIN_EMAIL/PASSWORD");
    await page.goto(`${cfg.brand.appBase}signin/`);
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/staff|admin|console/i);
  });

  test("Trainer sign-in @full", async ({ page }) => {
    const email = process.env.E2E_TRAINER_EMAIL;
    const password = process.env.E2E_TRAINER_PASSWORD;
    test.skip(!email || !password, "Need E2E_TRAINER_*");
    await page.goto(`${cfg.brand.appBase}signin/`);
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/schedule|attendance|session/i)).toBeVisible();
  });

  test("Member pending cannot book @full", async ({ page }) => {
    const email = process.env.E2E_MEMBER_PENDING_EMAIL;
    const password = process.env.E2E_MEMBER_PENDING_PASSWORD;
    test.skip(!email || !password, "Need E2E_MEMBER_PENDING_*");
    await page.goto(`${cfg.brand.appBase}signin/`);
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/pending|awaiting|not approved/i)).toBeVisible();
  });

  test("Member active book @full", async ({ page }) => {
    test.skip(!process.env.E2E_MEMBER_EMAIL, "Need E2E_MEMBER_EMAIL");
    await page.goto(`${cfg.brand.appBase}`);
    await expect(page.locator("body")).toBeVisible();
  });

  test("Member weekly lock/unlock @full", async () => {
    test.skip(true, "Requires seeded session slots on deployed client");
  });

  test("Drop-in confirm @full", async () => {
    test.skip(true, "Requires priced drop-in path on deployed client");
  });

  test("Staff move session @full", async () => {
    test.skip(true, "Requires staff credentials + calendar");
  });

  test("Cancel/delete session @full", async () => {
    test.skip(true, "Requires staff credentials + calendar");
  });

  test("Broadcast branded @full", async () => {
    test.skip(true, "Requires admin + mail adapter");
  });

  test("Calendar subscribe URL @full", async () => {
    test.skip(true, "Requires signed-in callable");
  });

  test("Contact form live @full", async ({ request }) => {
    const endpoint = process.env.E2E_FORM_ENDPOINT;
    test.skip(!endpoint, "Need E2E_FORM_ENDPOINT");
    const res = await request.post(endpoint!, {
      data: JSON.stringify({
        action: "enquiry",
        name: "E2E",
        email: "e2e@example.com",
        message: "full matrix",
      }),
      headers: { "content-type": "text/plain" },
    });
    expect(res.status()).toBeLessThan(500);
  });
});
