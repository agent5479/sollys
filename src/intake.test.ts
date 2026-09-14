import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  applyEngagementAnswers,
  intakeApplyAnswers,
  humanInfraChecklist,
  defaultDraftConfig,
} from "./intake.js";
import { loadClientConfig } from "./config/load.js";
import type { EngagementAnswers } from "./types.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("wl intake", () => {
  it("default draft has features.stack and empty structural slots", () => {
    const d = defaultDraftConfig();
    assert.equal(d.features?.stack, "booking");
    assert.equal(d.features?.surfaces?.marketing, true);
    assert.deepEqual(d.language?.classCatalog, []);
    assert.deepEqual(d.brand.contactBio, []);
    assert.equal(d.productCore?.functions, true);
    assert.equal(d.locale.seasonModel?.mode, "manual");
  });

  it("applyEngagementAnswers merges stack and terminology", () => {
    const answers: EngagementAnswers = {
      stack: "hybrid",
      surfaces: {
        marketing: true,
        memberApp: false,
        staffConsole: true,
        emailCalendar: true,
        manualPayments: false,
      },
      mPatterns: ["M24", "M22"],
      terminology: { admin: "Director", member: "Client" },
      brand: {
        name: "Bay Mediation",
        shortName: "BayMed",
        contactName: "Sam",
        contactRole: "Mediator",
        notifyEmail: "hello@bay.example",
        phone: "+64 21 111 2222",
        phoneHref: "tel:+64211112222",
        venues: [{ name: "Takaka office", address: "Golden Bay" }],
        origin: "https://www.bay.example",
        appBase: "/app/",
      },
      geoHint: "Golden Bay, New Zealand",
      infraBoundaryConfirmed: true,
      assumptionsAuthorized: true,
    };
    const { config, gaps } = applyEngagementAnswers(answers);
    assert.equal(config.features?.stack, "hybrid");
    assert.equal(config.features?.mPatterns?.includes("M24"), true);
    assert.equal(config.language?.roleLabels?.admin, "Director");
    assert.equal(config.locale.timeZone, "Pacific/Auckland");
    assert.equal(config.style.themeClass, "theme-baymed");
    assert.equal(config.productCore?.memberApp, false);
    assert.equal(config.productCore?.functions, true);
    assert.ok(gaps.every((g) => !g.includes("brand.name")));
  });

  it("round-trip example answers → valid config", () => {
    const dir = mkdtempSync(join(tmpdir(), "wl-intake-"));
    try {
      const out = join(dir, "client.config.json");
      const { config, gaps } = intakeApplyAnswers({
        answersPath: join(root, "examples/engagement-answers.example.json"),
        outPath: out,
      });
      assert.equal(config.features?.stack, "booking");
      assert.equal(config.brand.shortName, "Acme");
      assert.ok(Array.isArray(gaps));
      const raw = JSON.parse(readFileSync(out, "utf8"));
      assert.equal(raw.features.infraBoundaryConfirmed, true);
      const validated = loadClientConfig(out);
      assert.equal(validated.features?.surfaces?.staffConsole, true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("checklist mentions Apps Script and secrets", () => {
    const lines = humanInfraChecklist();
    assert.ok(lines.some((l) => /Apps Script/i.test(l)));
    assert.ok(lines.some((l) => /FUNCTIONS_WEBHOOK_SECRET/i.test(l)));
    assert.ok(lines.some((l) => /Calendar/i.test(l)));
  });
});
