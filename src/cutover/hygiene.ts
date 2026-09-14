import { randomBytes } from "node:crypto";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ClientConfig, PreviousBrand } from "../types.js";
import { checkBrandLeak } from "../check/brand-leak.js";
import { checkSeoPack } from "../check/seo.js";
import { runCmd } from "../provision/firebase.js";

export interface CutoverOptions {
  config: ClientConfig;
  root: string;
  previous?: PreviousBrand;
  previousProject?: string;
  seoRoot?: string;
  forceDeleteSa?: boolean;
  applySecret?: boolean;
  dryRun?: boolean;
}

export interface CutoverReport {
  newWebhookSecret?: string;
  commands: string[];
  domainFlags: string[];
  saFindings: string[];
  brandOk: boolean;
  seoOk: boolean;
  residualManual: string[];
}

function walkSaKeys(dir: string, acc: string[], depth = 0): void {
  if (depth > 6 || !existsSync(dir)) return;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git" || name === "dist") continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkSaKeys(p, acc, depth + 1);
    else if (
      /firebase-adminsdk/i.test(name) ||
      /^serviceAccount.*\.json$/i.test(name)
    ) {
      acc.push(p);
    }
  }
}

export async function runCutover(opts: CutoverOptions): Promise<CutoverReport> {
  const commands: string[] = [];
  const residualManual: string[] = [];
  const newSecret = randomBytes(32).toString("hex");
  const projectId = opts.config.infra.firebaseProjectId;

  commands.push(
    `firebase functions:secrets:set FUNCTIONS_WEBHOOK_SECRET --project ${projectId}`,
  );
  commands.push(
    `# Also set Apps Script property FUNCTIONS_WEBHOOK_SECRET to the same value`,
  );

  if (opts.applySecret && !opts.dryRun) {
    residualManual.push(
      "Secret apply requires interactive firebase CLI; run printed commands",
    );
  }

  const expectedHost = new URL(opts.config.brand.origin).hostname;
  const domainFlags: string[] = [
    `Ensure Auth authorized domains include: ${expectedHost}`,
  ];
  if (opts.previousProject) {
    domainFlags.push(
      `Review old project ${opts.previousProject}: remove unused authorized domains / continue URLs`,
    );
    residualManual.push(
      `Invalidate old Auth continue URLs on ${opts.previousProject}`,
    );
  }

  const saFindings: string[] = [];
  walkSaKeys(resolve(opts.root), saFindings);
  if (saFindings.length) {
    residualManual.push(
      `Remove or relocate SA keys (never commit): ${saFindings.join(", ")}`,
    );
    if (opts.forceDeleteSa) {
      residualManual.push(
        "--force-delete-sa requested but refuse auto-delete for safety; remove manually",
      );
    }
  }

  let brandOk = true;
  if (opts.previous) {
    const brand = await checkBrandLeak({
      root: opts.root,
      previous: opts.previous,
    });
    brandOk = brand.ok;
    if (!brand.ok) {
      residualManual.push(
        `Brand leak: ${brand.hits.length} hit(s) — run wl check-brand`,
      );
    }
  }

  const seoRoot = opts.seoRoot ?? join(opts.root, "seo");
  const seo = checkSeoPack({ root: existsSync(seoRoot) ? seoRoot : opts.root });
  const seoOk = seo.ok;
  if (!seo.ok) {
    residualManual.push(`SEO missing: ${seo.missing.join(", ")}`);
  }

  // Touch firebase CLI for project reminder
  runCmd("firebase", ["--version"], { dryRun: opts.dryRun });

  return {
    newWebhookSecret: newSecret,
    commands,
    domainFlags,
    saFindings,
    brandOk,
    seoOk,
    residualManual,
  };
}
