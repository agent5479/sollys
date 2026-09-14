import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ClientConfig, TemplateLineage } from "./types.js";
import { loadJson, packageVersion } from "./config/load.js";

export function stampLineage(
  configPath: string,
  opts: {
    upstreamCommit: string;
    upstreamRepo?: string;
    forkedAt?: string;
  },
): TemplateLineage {
  const abs = resolve(configPath);
  if (!existsSync(abs)) {
    throw new Error(`Config not found: ${abs}`);
  }
  const cfg = loadJson<ClientConfig>(abs);
  const lineage: TemplateLineage = {
    ...(cfg.templateLineage ?? { upstreamCommit: opts.upstreamCommit }),
    upstreamCommit: opts.upstreamCommit,
    toolkitVersion: packageVersion(),
    forkedAt: opts.forkedAt ?? new Date().toISOString(),
  };
  if (opts.upstreamRepo) lineage.upstreamRepo = opts.upstreamRepo;
  else if (cfg.templateLineage?.upstreamRepo) {
    lineage.upstreamRepo = cfg.templateLineage.upstreamRepo;
  }

  cfg.templateLineage = lineage;
  writeFileSync(abs, JSON.stringify(cfg, null, 2) + "\n", "utf8");
  return lineage;
}

export function readLineage(configPath: string): TemplateLineage {
  const cfg = loadJson<ClientConfig>(resolve(configPath));
  if (!cfg.templateLineage?.upstreamCommit) {
    throw new Error("templateLineage.upstreamCommit missing");
  }
  return cfg.templateLineage;
}
