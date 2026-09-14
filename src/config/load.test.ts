import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { collectTokens } from "../check/brand-leak.js";
import { generateThemeCss } from "../generate/theme-css.js";
import { generateSeoPack } from "../generate/seo-pack.js";
import { generateAppsScriptProperties } from "../generate/apps-script-properties.js";
import { generateEnvFiles } from "../generate/env-files.js";
import { generateClientPackModule } from "../generate/client-pack-module.js";
import { generateAll } from "../generate/index.js";
import { defaultDraftConfig } from "../intake.js";
import { assertCustomRules, loadClientConfig } from "./load.js";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const example = join(root, "examples/client.config.example.json");

describe("loadClientConfig", () => {
  it("loads example config", () => {
    const cfg = loadClientConfig(example);
    assert.equal(cfg.brand.shortName, "Acme");
    assert.ok(cfg.templateLineage.upstreamCommit.length >= 7);
    assert.equal(cfg.productCore?.functions, true);
    assert.deepEqual(cfg.language?.classCatalog, []);
  });
});

describe("assertCustomRules", () => {
  it("rejects licensed catalog without acknowledgment", () => {
    const cfg = structuredClone(loadClientConfig(example));
    cfg.language = {
      ...cfg.language,
      classCatalog: [
        { id: "x", name: "Licensed X", blurb: "", licensed: true },
      ],
      licensedCatalogAcknowledged: false,
    };
    assert.throws(() => assertCustomRules(cfg), /licensedCatalogAcknowledged/);
  });

  it("rejects booking stack without productCore completeness", () => {
    const cfg = structuredClone(loadClientConfig(example));
    cfg.productCore = { marketing: true };
    assert.throws(() => assertCustomRules(cfg), /productCore incomplete/);
  });
});

describe("collectTokens", () => {
  it("includes theme and hex fingerprints", () => {
    const tokens = collectTokens({
      tokens: ["Old"],
      themeClass: "theme-old",
      fingerprintHexes: ["863bff"],
    });
    assert.ok(tokens.includes("Old"));
    assert.ok(tokens.some((t) => t.includes("theme-old")));
    assert.ok(tokens.includes("863bff") || tokens.includes("#863bff"));
  });
});

describe("generators", () => {
  it("emits theme class and SEO files", () => {
    const cfg = loadClientConfig(example);
    const css = generateThemeCss(cfg);
    assert.match(css, /\.theme-acme/);
    assert.match(css, /--wl-accent/);
    assert.match(css, /--wl-primary/);
    const seo = generateSeoPack(cfg);
    assert.ok(seo["robots.txt"].includes("Disallow: /app/"));
    assert.ok(seo["sitemap.xml"].includes("<loc>"));
    assert.ok(seo["meta/index.html"].includes("og:title"));
    const props = generateAppsScriptProperties(cfg);
    assert.equal(props.NOTIFY_EMAIL, cfg.brand.notifyEmail);
    assert.equal(props.UID_DOMAIN, "www.acme.example");
  });

  it("emits split env files with structural keys", () => {
    const cfg = loadClientConfig(example);
    const env = generateEnvFiles(cfg);
    assert.match(env.appsExample, /VITE_APP_BASE=\/app\//);
    assert.match(env.functionsExample, /CALLABLE_ORIGINS=/);
    assert.match(
      env.functionsExample,
      /SIGN_IN_URL=https:\/\/www\.acme\.example\/app\/signin\//,
    );
    assert.match(env.rootExample, /VITE_CLIENT_ORIGIN=/);
  });

  it("draft generate stays structural (empty catalog/bio)", () => {
    const draft = defaultDraftConfig();
    assert.deepEqual(draft.brand.contactBio, []);
    assert.deepEqual(draft.language?.classCatalog, []);
    assert.match(draft.brand.name, /^TODO/);
    const mod = generateClientPackModule(draft);
    assert.match(mod, /"classCatalog": \[\]/);
    assert.match(mod, /"contactBio": \[\]/);
    assert.doesNotMatch(mod, /BodyBalance|Les Mills|Sweat/);
  });

  it("generateAll writes env, REBRAND, seeds, and in-kit assets", () => {
    const dir = mkdtempSync(join(tmpdir(), "wl-gen-"));
    try {
      const cfg = loadClientConfig(example);
      const result = generateAll({ config: cfg, outDir: dir });
      assert.ok(result.files.length > 5);
      assert.ok(existsSync(join(dir, "env/apps.env.example")));
      assert.ok(existsSync(join(dir, "env/root.env.example")));
      assert.ok(existsSync(join(dir, "env/functions.params.example.env")));
      assert.ok(existsSync(join(dir, "REBRAND_PROMPT.md")));
      assert.ok(existsSync(join(dir, "seeds/catalog.seed.json")));
      assert.ok(existsSync(join(dir, "brand-assets/logo-light.svg")));
      const seed = JSON.parse(
        readFileSync(join(dir, "seeds/catalog.seed.json"), "utf8"),
      ) as { classTypes: unknown[] };
      assert.deepEqual(seed.classTypes, []);
      const rebrand = readFileSync(join(dir, "REBRAND_PROMPT.md"), "utf8");
      assert.match(rebrand, /§L3/);
      assert.match(rebrand, /S1–S6/);
      assert.match(rebrand, /\*\*after\*\* the §L3 engagement interview/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
