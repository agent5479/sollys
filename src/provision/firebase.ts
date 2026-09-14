import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import type { ClientConfig, HostMap } from "../types.js";
import { loadJson } from "../config/load.js";

export interface DiscoverResult {
  map: HostMap;
  source: "host.map.json" | "heuristics" | "partial";
  missingRoles: string[];
}

const ROLE_HINTS: Record<keyof HostMap, string[]> = {
  marketing: ["apps/marketing", "marketing", "site", "src", "public"],
  apps: ["apps/member", "apps/app", "apps", "app", "member-app"],
  shared: ["shared", "packages/shared", "lib/shared"],
  functions: ["functions", "cloud-functions"],
  appsScript: [
    "google-apps-script",
    "apps-script",
    "appscript",
    "gas",
    "adapter",
  ],
  rules: ["firestore.rules"],
  indexes: ["firestore.indexes.json"],
  rulesTests: ["firestore-tests", "rules-tests", "tests/firestore"],
  seedScripts: ["functions/scripts", "scripts/seed", "seeds"],
  ciWorkflow: [
    ".github/workflows/pages.yml",
    ".github/workflows/deploy.yml",
    ".github/workflows/ci.yml",
  ],
  staticRoot: ["_site", "apps/marketing/dist", "dist", "public"],
};

/** Booking Product Core roles that must be discoverable (after S2). */
export const BOOKING_REQUIRED_HOST_ROLES: (keyof HostMap)[] = [
  "functions",
  "rules",
  "appsScript",
  "shared",
  "seedScripts",
];

export function loadHostMap(target: string): DiscoverResult {
  const root = resolve(target);
  const mapPath = join(root, "host.map.json");
  if (existsSync(mapPath)) {
    const map = loadJson<HostMap>(mapPath);
    return { map, source: "host.map.json", missingRoles: missing(map) };
  }

  const map: HostMap = {};
  for (const [role, hints] of Object.entries(ROLE_HINTS) as [
    keyof HostMap,
    string[],
  ][]) {
    for (const hint of hints) {
      if (existsSync(join(root, hint))) {
        map[role] = hint;
        break;
      }
    }
  }
  const miss = missing(map);
  return {
    map,
    source: miss.length ? "partial" : "heuristics",
    missingRoles: miss,
  };
}

function missing(map: HostMap): string[] {
  return BOOKING_REQUIRED_HOST_ROLES.filter((k) => !map[k]);
}

export function runCmd(
  cmd: string,
  args: string[],
  opts: { cwd?: string; dryRun?: boolean } = {},
): { status: number; stdout: string; stderr: string } {
  if (opts.dryRun) {
    console.log(`[dry-run] ${cmd} ${args.join(" ")}`);
    return { status: 0, stdout: "", stderr: "" };
  }
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return {
    status: r.status ?? 1,
    stdout: r.stdout ?? "",
    stderr: r.stderr ?? "",
  };
}

export interface ProvisionOptions {
  config: ClientConfig;
  target: string;
  dryRun?: boolean;
  skipAppsScript?: boolean;
  skipDeploy?: boolean;
  createProject?: boolean;
}

export interface ProvisionReport {
  steps: { name: string; status: "ok" | "skip" | "manual" | "fail"; detail: string }[];
  residualManual: string[];
}

export async function provisionFirebase(
  opts: ProvisionOptions,
): Promise<ProvisionReport> {
  const steps: ProvisionReport["steps"] = [];
  const residualManual: string[] = [];
  const projectId = opts.config.infra.firebaseProjectId;
  const discovered = loadHostMap(opts.target);

  steps.push({
    name: "discover-host-map",
    status: discovered.missingRoles.length ? "manual" : "ok",
    detail: `source=${discovered.source}; map=${JSON.stringify(discovered.map)}; missing=${discovered.missingRoles.join(",") || "none"}`,
  });

  if (discovered.missingRoles.length) {
    residualManual.push(
      `Create host.map.json in ${opts.target} mapping roles: ${discovered.missingRoles.join(", ")} (see examples/host.map.example.json)`,
    );
  }

  if (opts.createProject) {
    const r = runCmd(
      "firebase",
      ["projects:create", projectId, "--display-name", opts.config.brand.name],
      { dryRun: opts.dryRun },
    );
    steps.push({
      name: "firebase-projects-create",
      status: r.status === 0 ? "ok" : "manual",
      detail:
        r.status === 0
          ? `Created ${projectId}`
          : `Manual/billing gate: firebase projects:create ${projectId} (${r.stderr || r.stdout})`,
    });
    if (r.status !== 0) {
      residualManual.push(`Create Firebase project ${projectId} (billing may be required)`);
    }
  } else {
    steps.push({
      name: "firebase-projects-create",
      status: "skip",
      detail: `Using existing project ${projectId} (pass --create-project to attempt create)`,
    });
  }

  runCmd("firebase", ["use", projectId], {
    cwd: opts.target,
    dryRun: opts.dryRun,
  });
  steps.push({
    name: "firebase-use",
    status: "ok",
    detail: `firebase use ${projectId}`,
  });

  residualManual.push(
    "Enable Email/Password in Firebase Auth console (or Identity Platform API)",
  );
  residualManual.push(
    `Add authorized domains: ${new URL(opts.config.brand.origin).hostname}`,
  );
  residualManual.push("Create web app in Firebase console; copy config into .env");

  if (!opts.skipDeploy && discovered.map.rules) {
    const only = ["firestore:rules", "firestore:indexes", "functions"]
      .filter((part) => {
        if (part === "functions") return !!discovered.map.functions;
        return true;
      })
      .join(",");
    const r = runCmd("firebase", ["deploy", `--only`, only], {
      cwd: opts.target,
      dryRun: opts.dryRun,
    });
    steps.push({
      name: "firebase-deploy",
      status: r.status === 0 ? "ok" : "fail",
      detail: r.status === 0 ? `deployed ${only}` : r.stderr || r.stdout || "deploy failed",
    });
  } else {
    steps.push({
      name: "firebase-deploy",
      status: "skip",
      detail: opts.skipDeploy ? "skipped by flag" : "no rules path mapped",
    });
  }

  const signIn = `${opts.config.brand.origin}${opts.config.brand.appBase}signin/`;
  residualManual.push(
    `Set Functions params: FORM_ENDPOINT, SIGN_IN_URL=${signIn}, CALLABLE_ORIGINS, TIME_ZONE=${opts.config.locale.timeZone}`,
  );
  residualManual.push(
    "Set secret FUNCTIONS_WEBHOOK_SECRET (firebase functions:secrets:set)",
  );

  if (opts.config.adminBootstrap?.email || opts.config.adminBootstrap?.uid) {
    residualManual.push(
      `Bootstrap admin claim for ${opts.config.adminBootstrap.email ?? opts.config.adminBootstrap.uid} via Admin SDK (GOOGLE_APPLICATION_CREDENTIALS)`,
    );
    steps.push({
      name: "admin-bootstrap",
      status: "manual",
      detail: "Requires local SA key — see wl provision --help",
    });
  }

  residualManual.push(
    "Phase 4 DNS: CNAME/A records, SSL wait, CI secrets for hosting",
  );

  return { steps, residualManual };
}

export async function provisionAppsScript(
  opts: ProvisionOptions,
): Promise<ProvisionReport> {
  const steps: ProvisionReport["steps"] = [];
  const residualManual: string[] = [];
  if (opts.skipAppsScript) {
    return {
      steps: [{ name: "apps-script", status: "skip", detail: "skipped by flag" }],
      residualManual: [],
    };
  }

  const discovered = loadHostMap(opts.target);
  const scriptDir = discovered.map.appsScript
    ? join(opts.target, discovered.map.appsScript)
    : undefined;

  if (!scriptDir || !existsSync(scriptDir)) {
    residualManual.push(
      "Map appsScript in host.map.json to adapter source directory, then re-run",
    );
    return {
      steps: [
        {
          name: "apps-script",
          status: "manual",
          detail: "appsScript path not found",
        },
      ],
      residualManual,
    };
  }

  const hasClasp = existsSync(join(scriptDir, ".clasp.json"));
  if (!hasClasp) {
    const r = runCmd("clasp", ["create", "--type", "webapp", "--title", opts.config.brand.shortName], {
      cwd: scriptDir,
      dryRun: opts.dryRun,
    });
    steps.push({
      name: "clasp-create",
      status: r.status === 0 ? "ok" : "manual",
      detail: r.status === 0 ? "created" : "clasp login / create manually",
    });
    if (r.status !== 0) residualManual.push("clasp login && clasp create in apps-script dir");
  } else {
    steps.push({ name: "clasp-create", status: "skip", detail: ".clasp.json exists" });
  }

  const push = runCmd("clasp", ["push", "-f"], {
    cwd: scriptDir,
    dryRun: opts.dryRun,
  });
  steps.push({
    name: "clasp-push",
    status: push.status === 0 ? "ok" : "fail",
    detail: push.status === 0 ? "pushed" : push.stderr || push.stdout,
  });

  residualManual.push(
    "Set Script Properties from generated apps-script/script-properties.json (NOTIFY_EMAIL, CALENDAR_ID, FUNCTIONS_WEBHOOK_SECRET, brand map)",
  );
  residualManual.push(
    "Deploy Web app: Execute as Me, access Anyone; copy /exec → FORM_ENDPOINT + VITE_FORM_ENDPOINT",
  );
  residualManual.push("Create/share calendar; set CALENDAR_ID");

  return { steps, residualManual };
}

export async function provisionAll(
  opts: ProvisionOptions,
): Promise<ProvisionReport> {
  const a = await provisionFirebase(opts);
  const b = await provisionAppsScript(opts);
  return {
    steps: [...a.steps, ...b.steps],
    residualManual: [...a.residualManual, ...b.residualManual],
  };
}

/** Attempt admin custom claim when GOOGLE_APPLICATION_CREDENTIALS is set */
export async function bootstrapAdminClaim(
  cfg: ClientConfig,
): Promise<{ ok: boolean; detail: string }> {
  const email = cfg.adminBootstrap?.email;
  const uid = cfg.adminBootstrap?.uid;
  if (!email && !uid) {
    return { ok: false, detail: "adminBootstrap.email or .uid required" };
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      ok: false,
      detail: "Set GOOGLE_APPLICATION_CREDENTIALS to SA JSON path",
    };
  }
  try {
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: cfg.infra.firebaseProjectId });
    }
    const user = uid
      ? await admin.auth().getUser(uid)
      : await admin.auth().getUserByEmail(email!);
    await admin.auth().setCustomUserClaims(user.uid, {
      ...(user.customClaims ?? {}),
      admin: true,
    });
    return { ok: true, detail: `admin claim set on ${user.uid}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}
