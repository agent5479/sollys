import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface SeoCheckResult {
  ok: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED = ["robots.txt", "sitemap.xml"];

export function checkSeoPack(opts: {
  root: string;
  requireMeta?: boolean;
}): SeoCheckResult {
  const root = resolve(opts.root);
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const f of REQUIRED) {
    if (!existsSync(join(root, f))) missing.push(f);
  }

  const robotsPath = join(root, "robots.txt");
  if (existsSync(robotsPath)) {
    const robots = readFileSync(robotsPath, "utf8");
    if (!/sitemap:/i.test(robots)) {
      warnings.push("robots.txt missing Sitemap: directive");
    }
    if (!/disallow:/i.test(robots)) {
      warnings.push("robots.txt has no Disallow rules (expected app base)");
    }
  }

  const sitemapPath = join(root, "sitemap.xml");
  if (existsSync(sitemapPath)) {
    const sm = readFileSync(sitemapPath, "utf8");
    if (!/<urlset/i.test(sm) || !/<loc>/i.test(sm)) {
      missing.push("sitemap.xml (invalid: no urlset/loc)");
    }
  }

  if (opts.requireMeta !== false) {
    const metaDir = join(root, "meta");
    if (!existsSync(metaDir)) {
      warnings.push("meta/ directory missing (generated HTML meta fragments)");
    }
  }

  const jsonLd = join(root, "json-ld.local-business.json");
  if (!existsSync(jsonLd)) {
    warnings.push("json-ld.local-business.json missing");
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}
