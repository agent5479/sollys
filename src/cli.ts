#!/usr/bin/env node
import { resolve } from "node:path";
import { Command } from "commander";
import { loadClientConfig, loadPreviousBrand, loadJson } from "./config/load.js";
import { generateAll } from "./generate/index.js";
import { checkBrandLeak } from "./check/brand-leak.js";
import { checkSeoPack } from "./check/seo.js";
import { stampLineage, readLineage } from "./lineage.js";
import {
  provisionAll,
  bootstrapAdminClaim,
  loadHostMap,
} from "./provision/firebase.js";
import { runCutover } from "./cutover/hygiene.js";
import { spawnSync } from "node:child_process";
import { toolkitRoot } from "./config/load.js";
import {
  intakeInit,
  intakeApplyAnswers,
  humanInfraChecklist,
  writeAssumptionsStub,
  readOptionalConfig,
} from "./intake.js";

const program = new Command();

program
  .name("wl")
  .description("White-label pivot toolkit")
  .version("0.1.0");

program
  .command("validate")
  .description("Validate client.config.json (§B6 gate)")
  .requiredOption("-c, --config <path>", "Path to client.config.json")
  .action((opts: { config: string }) => {
    const cfg = loadClientConfig(opts.config);
    console.log(`OK: ${cfg.brand.name} (${cfg.infra.firebaseProjectId})`);
  });

program
  .command("generate")
  .description("Generate Client Pack artifacts from config")
  .requiredOption("-c, --config <path>", "Path to client.config.json")
  .option("-o, --out <dir>", "Output directory", "generated")
  .option(
    "--host-map <path>",
    "Optional host.map.json to embed apply path hints in MANIFEST",
  )
  .action((opts: { config: string; out: string; hostMap?: string }) => {
    const cfg = loadClientConfig(opts.config);
    const map = opts.hostMap
      ? loadJson<import("./types.js").HostMap>(resolve(opts.hostMap))
      : undefined;
    const result = generateAll({
      config: cfg,
      outDir: opts.out,
      hostMap: map,
    });
    console.log(`Generated ${result.files.length} files → ${resolve(opts.out)}`);
    for (const f of result.files) console.log(`  ${f}`);
  });

program
  .command("check-brand")
  .description("Fail if previous brand tokens leak outside allowlist (§J3/M22)")
  .option("-c, --config <path>", "client.config.json (uses previousBrand)")
  .option("-p, --previous <path>", "previous-brand.tokens.json")
  .requiredOption("-r, --root <dir>", "Host tree to scan")
  .option("--allow-path <path>", "Extra allow path", collect, [])
  .action(
    async (opts: {
      config?: string;
      previous?: string;
      root: string;
      allowPath: string[];
    }) => {
      let previous;
      if (opts.previous) {
        previous = loadPreviousBrand(opts.previous);
      } else if (opts.config) {
        const cfg = loadClientConfig(opts.config);
        previous = loadPreviousBrand(cfg);
      } else {
        throw new Error("Pass --previous or --config with previousBrand");
      }
      const result = await checkBrandLeak({
        root: opts.root,
        previous,
        extraAllowPaths: opts.allowPath,
      });
      console.log(
        `Scanned ${result.scannedFiles} files; tokens=${result.searchedTokens.length}`,
      );
      if (!result.ok) {
        for (const h of result.hits) {
          console.error(`${h.file}:${h.line} [${h.token}] ${h.excerpt}`);
        }
        process.exitCode = 1;
        console.error(`FAIL: ${result.hits.length} brand-leak hit(s)`);
      } else {
        console.log("OK: no brand leakage");
      }
    },
  );

program
  .command("check-seo")
  .description("Assert robots/sitemap/meta pack present (§H4/M22)")
  .requiredOption("-r, --root <dir>", "SEO output or static root")
  .action((opts: { root: string }) => {
    const result = checkSeoPack({ root: opts.root });
    for (const w of result.warnings) console.warn(`WARN: ${w}`);
    if (!result.ok) {
      console.error(`FAIL missing: ${result.missing.join(", ")}`);
      process.exitCode = 1;
    } else {
      console.log("OK: SEO pack present");
    }
  });

program
  .command("lineage")
  .description("Template lineage helpers")
  .addCommand(
    new Command("stamp")
      .description("Write templateLineage into client config")
      .requiredOption("-c, --config <path>", "client.config.json")
      .requiredOption("--commit <sha>", "Upstream Product Core commit")
      .option("--repo <url>", "Upstream repo URL")
      .action(
        (opts: { config: string; commit: string; repo?: string }) => {
          const lineage = stampLineage(opts.config, {
            upstreamCommit: opts.commit,
            upstreamRepo: opts.repo,
          });
          console.log(JSON.stringify(lineage, null, 2));
        },
      ),
  )
  .addCommand(
    new Command("show")
      .description("Print templateLineage from config")
      .requiredOption("-c, --config <path>", "client.config.json")
      .action((opts: { config: string }) => {
        console.log(JSON.stringify(readLineage(opts.config), null, 2));
      }),
  );

program
  .command("intake")
  .description("Kickoff interview helpers → draft client.config.json")
  .addCommand(
    new Command("init")
      .description("Write a TODO draft client.config.json")
      .option("-o, --out <path>", "Output path", "client.config.json")
      .action((opts: { out: string }) => {
        const cfg = intakeInit(opts.out);
        console.log(`Wrote draft ${resolve(opts.out)} (${cfg.brand.name})`);
      }),
  )
  .addCommand(
    new Command("apply-answers")
      .description("Merge engagement-answers.json into client.config.json")
      .requiredOption("-a, --answers <path>", "engagement-answers.json")
      .option("-o, --out <path>", "Output client.config.json", "client.config.json")
      .option("-b, --base <path>", "Optional base config to merge onto")
      .option("--strict", "Fail if wl validate would fail", false)
      .option("--assumptions <path>", "Write CLIENT_ASSUMPTIONS.md when gaps remain")
      .action((opts: {
        answers: string;
        out: string;
        base?: string;
        strict?: boolean;
        assumptions?: string;
      }) => {
        const { config, gaps } = intakeApplyAnswers({
          answersPath: opts.answers,
          outPath: opts.out,
          basePath: opts.base,
        });
        console.log(`Wrote ${resolve(opts.out)}`);
        console.log(
          `features.stack=${config.features?.stack}; surfaces=${JSON.stringify(config.features?.surfaces)}`,
        );
        if (gaps.length) {
          console.log("Gaps:");
          for (const g of gaps) console.log(`  - ${g}`);
          if (opts.assumptions && config.features?.assumptionsAuthorized) {
            writeAssumptionsStub(
              opts.assumptions,
              gaps,
              undefined,
            );
            console.log(`Wrote ${resolve(opts.assumptions)}`);
          }
        } else {
          console.log("No gaps flagged");
        }
        if (opts.strict) {
          loadClientConfig(opts.out);
          console.log("Strict validate: OK");
        }
      }),
  )
  .addCommand(
    new Command("checklist")
      .description("Print human Firebase / Apps Script / Calendar / secrets checklist")
      .option("-c, --config <path>", "Optional client.config.json")
      .action((opts: { config?: string }) => {
        const cfg = opts.config
          ? readOptionalConfig(opts.config)
          : undefined;
        for (const line of humanInfraChecklist(cfg)) {
          console.log(`- [ ] ${line}`);
        }
      }),
  );

program
  .command("discover")
  .description("Discover or validate host.map.json roles")
  .requiredOption("-t, --target <dir>", "Host product repo")
  .action((opts: { target: string }) => {
    const d = loadHostMap(opts.target);
    console.log(JSON.stringify(d, null, 2));
    if (d.missingRoles.length) process.exitCode = 1;
  });

program
  .command("provision")
  .description("Phase 2–4 provisioning orchestrator (Firebase + clasp)")
  .requiredOption("-c, --config <path>", "client.config.json")
  .requiredOption("-t, --target <dir>", "Host product repo")
  .option("--dry-run", "Print commands only", false)
  .option("--create-project", "Attempt firebase projects:create", false)
  .option("--skip-deploy", "Skip firebase deploy", false)
  .option("--skip-apps-script", "Skip clasp steps", false)
  .option("--bootstrap-admin", "Set admin claim if credentials present", false)
  .action(
    async (opts: {
      config: string;
      target: string;
      dryRun?: boolean;
      createProject?: boolean;
      skipDeploy?: boolean;
      skipAppsScript?: boolean;
      bootstrapAdmin?: boolean;
    }) => {
      const cfg = loadClientConfig(opts.config);
      const report = await provisionAll({
        config: cfg,
        target: opts.target,
        dryRun: opts.dryRun,
        createProject: opts.createProject,
        skipDeploy: opts.skipDeploy,
        skipAppsScript: opts.skipAppsScript,
      });
      for (const s of report.steps) {
        console.log(`[${s.status}] ${s.name}: ${s.detail}`);
      }
      if (opts.bootstrapAdmin) {
        const b = await bootstrapAdminClaim(cfg);
        console.log(`[${b.ok ? "ok" : "manual"}] admin-bootstrap: ${b.detail}`);
      }
      console.log("\nResidual manual checklist:");
      for (const m of report.residualManual) console.log(`  - ${m}`);
    },
  );

program
  .command("cutover")
  .description("Phase 7 cutover hygiene")
  .requiredOption("-c, --config <path>", "client.config.json")
  .requiredOption("-r, --root <dir>", "Host tree")
  .option("-p, --previous <path>", "previous-brand.tokens.json")
  .option("--previous-project <id>", "Old Firebase project id")
  .option("--seo-root <dir>", "SEO pack directory")
  .option("--dry-run", "Skip CLI side effects", false)
  .action(
    async (opts: {
      config: string;
      root: string;
      previous?: string;
      previousProject?: string;
      seoRoot?: string;
      dryRun?: boolean;
    }) => {
      const cfg = loadClientConfig(opts.config);
      const previous = opts.previous
        ? loadPreviousBrand(opts.previous)
        : cfg.previousBrand;
      const report = await runCutover({
        config: cfg,
        root: opts.root,
        previous,
        previousProject: opts.previousProject,
        seoRoot: opts.seoRoot,
        dryRun: opts.dryRun,
      });
      console.log("Webhook secret candidate (store in secret manager, do not commit):");
      console.log(report.newWebhookSecret);
      console.log("\nCommands:");
      for (const c of report.commands) console.log(`  ${c}`);
      console.log("\nDomains:");
      for (const d of report.domainFlags) console.log(`  - ${d}`);
      if (report.saFindings.length) {
        console.log("\nSA key findings:");
        for (const s of report.saFindings) console.log(`  - ${s}`);
      }
      console.log(`\nBrand check: ${report.brandOk ? "OK" : "FAIL"}`);
      console.log(`SEO check: ${report.seoOk ? "OK" : "FAIL"}`);
      if (report.residualManual.length) {
        console.log("\nResidual:");
        for (const m of report.residualManual) console.log(`  - ${m}`);
      }
      if (!report.brandOk || !report.seoOk) process.exitCode = 1;
    },
  );

program
  .command("e2e")
  .description("Run §J2 matrix (smoke via node; --full runs Playwright @full)")
  .option("-c, --config <path>", "client.config.json", "examples/client.config.example.json")
  .option("--full", "Run Playwright @full tagged tests", false)
  .action((opts: { config: string; full?: boolean }) => {
    if (!opts.full) {
      const r = spawnSync(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["tsx", "--test", resolve(toolkitRoot(), "src/e2e/j2-smoke.test.ts")],
        {
          cwd: toolkitRoot(),
          env: { ...process.env, WL_CLIENT_CONFIG: resolve(opts.config) },
          stdio: "inherit",
          shell: process.platform === "win32",
        },
      );
      process.exitCode = r.status ?? 1;
      return;
    }
    const env = {
      ...process.env,
      WL_CLIENT_CONFIG: resolve(opts.config),
      E2E_FULL: "1",
    };
    const r = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["playwright", "test"],
      {
        cwd: toolkitRoot(),
        env,
        stdio: "inherit",
        shell: process.platform === "win32",
      },
    );
    process.exitCode = r.status ?? 1;
  });

function collect(value: string, prior: string[]): string[] {
  return prior.concat([value]);
}

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
