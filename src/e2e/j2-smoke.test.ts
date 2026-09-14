import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSeoPack } from "../check/seo.js";
import { checkBrandLeak } from "../check/brand-leak.js";
import { loadPreviousBrand, loadClientConfig } from "../config/load.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("§J2 smoke matrix (node)", () => {
  it("SEO smoke @smoke", () => {
    const seo = checkSeoPack({ root: join(root, "fixtures/seo-ok") });
    assert.equal(seo.ok, true, seo.missing.join(","));
  });

  it("Brand grep clean tree @smoke", async () => {
    const previous = loadPreviousBrand(
      join(root, "examples/previous-brand.tokens.json"),
    );
    const result = await checkBrandLeak({
      root: join(root, "fixtures/brand-clean"),
      previous,
    });
    assert.equal(result.ok, true);
  });

  it("Brand grep detects leaks @smoke", async () => {
    const previous = loadPreviousBrand(
      join(root, "examples/previous-brand.tokens.json"),
    );
    const result = await checkBrandLeak({
      root: join(root, "fixtures/brand-leak"),
      previous,
      extraAllowPaths: ["allowed/"],
    });
    assert.equal(result.ok, false);
    assert.ok(result.hits.length > 0);
  });

  it("Contact form POST shape @smoke", () => {
    const cfg = loadClientConfig(
      join(root, "examples/client.config.example.json"),
    );
    const body = {
      action: "enquiry",
      name: "Test",
      email: "test@example.com",
      message: "Pivot kit smoke",
    };
    assert.equal(body.action, "enquiry");
    assert.match(cfg.brand.notifyEmail, /@/);
  });

  it("CORS / origin config @smoke", () => {
    const cfg = loadClientConfig(
      join(root, "examples/client.config.example.json"),
    );
    assert.ok(cfg.brand.origin.startsWith("https://"));
    assert.ok(cfg.brand.appBase.startsWith("/"));
    assert.ok((cfg.infra.callableOrigins?.length ?? 0) > 0);
    assert.equal(cfg.infra.signInPath, "signin/");
  });
});
