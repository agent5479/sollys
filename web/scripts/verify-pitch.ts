import { chromium } from "@playwright/test";

const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  await page.goto(base + "/");
  await page.getByRole("heading", { name: /connecting people and products/i }).waitFor();

  await page.getByRole("link", { name: "Track a consignment" }).click();
  await page.getByRole("button", { name: "Try SL-4821" }).click();
  await page.getByRole("heading", { name: "SL-4821" }).waitFor();

  await page.goto(base + "/app/signin");
  await page.getByRole("button", { name: /Driver/i }).click();
  await page.getByRole("heading", { name: /Tane/i }).waitFor();
  await page.getByRole("button", { name: "Type code instead" }).click();
  await page.getByLabel("Consignment code").fill("SL-4821");
  await page.getByRole("button", { name: "Use demo GPS" }).click();
  await page.getByText(/SL-4821 tagged|saved offline/i).waitFor();

  await page.getByRole("link", { name: "Switch role" }).click();
  await page.getByRole("button", { name: /Admin/i }).click();
  await page.getByRole("heading", { name: "Live location" }).waitFor();
  await page.getByText(/Trucks on feed/i).waitFor();
  await page.getByRole("tablist").getByRole("link", { name: "Consignments" }).click();
  await page.getByRole("cell", { name: "SL-4821" }).first().click();
  await page.getByRole("heading", { name: "SL-4821" }).waitFor();
  await page.getByRole("tablist").getByRole("link", { name: "Fleet" }).click();
  await page.getByText("SLY412").waitFor();

  await browser.close();
  console.log("Clean demo OK: track → driver tag → ops map/consignments/fleet.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
