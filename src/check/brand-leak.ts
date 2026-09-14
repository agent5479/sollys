import { readFileSync, existsSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import fg from "fast-glob";
import type { PreviousBrand } from "../types.js";

const DEFAULT_ALLOW = [
  "whitelabel.md",
  "CLIENT_ASSUMPTIONS.md",
  "docs/obsolete/",
  "node_modules/",
  "dist/",
  ".tmp/",
  "package-lock.json",
];

const TEXT_GLOBS = [
  "**/*.{ts,tsx,js,jsx,mjs,cjs,json,html,css,scss,md,txt,xml,yml,yaml,env,svg,webmanifest}",
  "**/CNAME",
  "**/robots.txt",
  "**/sitemap.xml",
];

export interface BrandHit {
  file: string;
  line: number;
  token: string;
  excerpt: string;
}

export interface BrandCheckResult {
  ok: boolean;
  hits: BrandHit[];
  searchedTokens: string[];
  scannedFiles: number;
}

function normalizeAllow(paths: string[]): string[] {
  return [...DEFAULT_ALLOW, ...paths].map((p) => p.replace(/\\/g, "/"));
}

function isAllowed(relPath: string, allowPaths: string[]): boolean {
  const norm = relPath.replace(/\\/g, "/");
  return allowPaths.some((a) => {
    if (a.endsWith("/")) return norm.startsWith(a) || norm.includes("/" + a);
    return norm === a || norm.endsWith("/" + a);
  });
}

export function collectTokens(prev: PreviousBrand): string[] {
  const out: string[] = [];
  for (const t of prev.tokens ?? []) out.push(t);
  for (const t of prev.domains ?? []) out.push(t);
  for (const t of prev.emails ?? []) out.push(t);
  for (const t of prev.phones ?? []) out.push(t);
  if (prev.themeClass) {
    out.push(prev.themeClass);
    out.push(`.${prev.themeClass.replace(/^\./, "")}`);
  }
  if (prev.prodIdDomain) out.push(prev.prodIdDomain);
  for (const hex of prev.fingerprintHexes ?? []) {
    out.push(hex);
    out.push(`#${hex}`);
  }
  // Deduplicate, drop empties, prefer longer first for clearer reporting
  return [...new Set(out.map((s) => s.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
}

export async function checkBrandLeak(opts: {
  root: string;
  previous: PreviousBrand;
  extraAllowPaths?: string[];
}): Promise<BrandCheckResult> {
  const root = resolve(opts.root);
  if (!existsSync(root)) {
    throw new Error(`Brand-check root does not exist: ${root}`);
  }
  const allowPaths = normalizeAllow([
    ...(opts.previous.allowPaths ?? []),
    ...(opts.extraAllowPaths ?? []),
  ]);
  const tokens = collectTokens(opts.previous);
  if (tokens.length === 0) {
    throw new Error("previousBrand has no tokens to search");
  }

  const files = await fg(TEXT_GLOBS, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
    dot: false,
    ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/.tmp/**"],
  });

  const hits: BrandHit[] = [];
  for (const abs of files) {
    const rel = relative(root, abs).split(sep).join("/");
    if (isAllowed(rel, allowPaths)) continue;
    let content: string;
    try {
      content = readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const token of tokens) {
        if (line.toLowerCase().includes(token.toLowerCase())) {
          hits.push({
            file: rel,
            line: i + 1,
            token,
            excerpt: line.trim().slice(0, 200),
          });
          break;
        }
      }
    }
  }

  return {
    ok: hits.length === 0,
    hits,
    searchedTokens: tokens,
    scannedFiles: files.length,
  };
}
