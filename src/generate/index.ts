import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { ClientConfig, HostMap } from "../types.js";
import { generateThemeCss } from "./theme-css.js";
import { generateEnvFiles } from "./env-files.js";
import { generateAppsScriptProperties } from "./apps-script-properties.js";
import { generateClientPackModule } from "./client-pack-module.js";
import { generateSeoPack } from "./seo-pack.js";
import {
  buildManifest,
  generateBrandAssetsReadme,
  generateRebrandPrompt,
  generateSeedSkeleton,
  generateSeedsReadme,
} from "./rebrand-prompt.js";
import { toolkitRoot } from "../config/load.js";
import { writeFileSync } from "node:fs";

export interface GenerateOptions {
  config: ClientConfig;
  outDir: string;
  hostMap?: HostMap;
}

export interface GenerateResult {
  files: string[];
}

export function writeText(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function copyInKitBrandAssets(outBrandDir: string): string[] {
  const srcDir = join(toolkitRoot(), "templates", "brand");
  mkdirSync(outBrandDir, { recursive: true });
  const copied: string[] = [];
  if (!existsSync(srcDir)) {
    return copied;
  }
  for (const name of readdirSync(srcDir)) {
    const from = join(srcDir, name);
    const to = join(outBrandDir, name);
    copyFileSync(from, to);
    copied.push(to);
  }
  return copied;
}

export function generateAll(opts: GenerateOptions): GenerateResult {
  const out = resolve(opts.outDir);
  const files: string[] = [];

  const track = (rel: string, content: string) => {
    const abs = join(out, rel);
    writeText(abs, content);
    files.push(abs);
  };

  track(`theme/${opts.config.style.themeClass}.css`, generateThemeCss(opts.config));
  const env = generateEnvFiles(opts.config);
  track("env/root.env.example", env.rootExample);
  track("env/apps.env.example", env.appsExample);
  track("env/functions.params.example.env", env.functionsExample);
  track(
    "apps-script/script-properties.json",
    JSON.stringify(generateAppsScriptProperties(opts.config), null, 2) + "\n",
  );
  track("client-pack/brand.ts", generateClientPackModule(opts.config));
  const seo = generateSeoPack(opts.config);
  for (const [rel, content] of Object.entries(seo)) {
    track(`seo/${rel}`, content);
  }

  track("seeds/catalog.seed.json", generateSeedSkeleton());
  track("seeds/README.md", generateSeedsReadme());
  track("brand-assets/README.md", generateBrandAssetsReadme());
  track("REBRAND_PROMPT.md", generateRebrandPrompt(opts.config));

  const copied = copyInKitBrandAssets(join(out, "brand-assets"));
  files.push(...copied);

  const relFiles = files.map((f) => f.replace(out + "\\", "").replace(out + "/", ""));
  track(
    "MANIFEST.json",
    buildManifest(opts.config, relFiles, opts.hostMap),
  );

  return { files };
}
