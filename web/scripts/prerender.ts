/**
 * Copy SPA shell into static routes and overlay the generated SEO pack.
 * Does not crawl a running server — Vite HTML already includes home meta;
 * /track/ gets the track meta fragment + the same shell.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const seo = join(root, "..", "generated", "seo");

function ensureDir(p: string) {
  mkdirSync(p, { recursive: true });
}

function injectMeta(html: string, fragmentPath: string, robots?: string): string {
  const frag = existsSync(fragmentPath) ? readFileSync(fragmentPath, "utf8") : "";
  let next = html;
  if (robots) {
    next = next.replace("</head>", `    <meta name="robots" content="${robots}" />\n  </head>`);
  }
  if (frag) {
    next = next.replace("</head>", `${frag}\n  </head>`);
  }
  if (!/data-seo-ready/.test(next)) {
    next = next.replace("<html", '<html data-seo-ready="true"');
  }
  return next;
}

if (!existsSync(join(dist, "index.html"))) {
  throw new Error("Run vite build first");
}

const shell = readFileSync(join(dist, "index.html"), "utf8");
writeFileSync(join(dist, "index.html"), injectMeta(shell, join(seo, "meta", "index.html")));

ensureDir(join(dist, "track"));
writeFileSync(
  join(dist, "track", "index.html"),
  injectMeta(shell, join(seo, "meta", "track.html")),
);

copyFileSync(join(dist, "index.html"), join(dist, "404.html"));

for (const name of ["robots.txt", "sitemap.xml", "json-ld.local-business.json", "llms.txt"]) {
  const from = join(seo, name);
  if (existsSync(from)) copyFileSync(from, join(dist, name));
}

ensureDir(join(dist, "meta"));
for (const name of ["index.html", "track.html"]) {
  const from = join(seo, "meta", name);
  if (existsSync(from)) copyFileSync(from, join(dist, "meta", name));
}

console.log("Prerender shells written for / and /track/");
