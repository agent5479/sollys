import { chromium } from "@playwright/test";

const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  await page.goto(base + "/");
  await page.getByRole("heading", { name: /connecting people and products/i }).waitFor();

  await page.getByRole("link", { name: "Track a consignment" }).click();
  await page.getByLabel("Tracking code").fill("SL-4821");
  await page.getByRole("button", { name: "Look up" }).click();
  await page.getByRole("heading", { name: "SL-4821" }).waitFor();

  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Driver —/ }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("heading", { name: /Scan and tag GPS/i }).waitFor();
  await page.getByRole("button", { name: "Simulate GPS" }).click();
  await page.getByText(/Tagged SL-4821/i).waitFor();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Admin —/ }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("heading", { name: "Operations" }).waitFor();
  await page.getByRole("tab", { name: "Fleet" }).click();
  await page.getByText("TK-12").waitFor();
  await page.getByRole("tab", { name: "Calculator" }).click();
  await page.getByText(/Road time/i).waitFor();
  await page.getByRole("tab", { name: "Outbox" }).click();
  await page.getByText(/Scan SL-4821/i).waitFor();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Client —/ }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("heading", { name: /Reserve leftover space/i }).waitFor();
  await page.getByRole("button", { name: "Book leftover space" }).click();
  await page.getByText(/Booking b-/i).waitFor();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Admin —/ }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("tab", { name: "Calculator" }).click();
  await page.getByText(/Pallet of bagged feed|350 kg/i).waitFor();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(base + "/track");
  await mobile.getByRole("button", { name: "Look up" }).click();
  await mobile.getByRole("heading", { name: "SL-4821" }).waitFor();

  await browser.close();
  console.log("Pitch flows OK: marketing, track, driver GPS, admin fleet/outbox, client booking, mobile track.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
