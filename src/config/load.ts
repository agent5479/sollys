import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ErrorObject } from "ajv";
import type { ClientConfig, PreviousBrand } from "../types.js";

// CJS/ESM interop for ajv under NodeNext
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js") as new (opts?: object) => {
  compile: (schema: object) => {
    (data: unknown): data is ClientConfig;
    errors?: ErrorObject[] | null;
  };
};
const addFormats = require("ajv-formats") as (ajv: unknown) => void;

const __dirname = dirname(fileURLToPath(import.meta.url));

export function schemaPath(): string {
  return resolve(__dirname, "../../schemas/client.config.schema.json");
}

export function loadJson<T>(path: string): T {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as T;
}

export function createValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schema = loadJson<object>(schemaPath());
  return ajv.compile(schema);
}

export function loadClientConfig(configPath: string): ClientConfig {
  const abs = resolve(configPath);
  const data = loadJson<ClientConfig>(abs);
  const validate = createValidator();
  if (!validate(data)) {
    const details = (validate.errors ?? [])
      .map((e) => `  - ${e.instancePath || "/"} ${e.message}`)
      .join("\n");
    throw new Error(`Invalid client config (${abs}):\n${details}`);
  }
  assertCustomRules(data);
  return data;
}

const BOOKING_PRODUCT_CORE_KEYS = [
  "sharedClient",
  "functions",
  "firestoreRules",
  "firestoreIndexes",
  "appsScript",
  "seedScripts",
  "adminBootstrap",
] as const;

/** §B6 extras beyond JSON Schema */
export function assertCustomRules(cfg: ClientConfig): void {
  if (cfg.brand.origin.endsWith("/")) {
    throw new Error("brand.origin must not have a trailing slash");
  }
  if (!cfg.brand.appBase.startsWith("/") || !cfg.brand.appBase.endsWith("/")) {
    throw new Error("brand.appBase must start and end with /");
  }

  const catalog = cfg.language?.classCatalog ?? [];
  const hasLicensed = catalog.some((c) => c.licensed === true);
  if (hasLicensed && !cfg.language?.licensedCatalogAcknowledged) {
    throw new Error(
      "language.licensedCatalogAcknowledged must be true when any classCatalog item has licensed: true",
    );
  }

  const stack = cfg.features?.stack;
  if (stack === "booking" || stack === "hybrid") {
    const pc = cfg.productCore;
    if (!pc) {
      throw new Error(
        "productCore is required when features.stack is booking or hybrid (after S2 surface selection)",
      );
    }
    const missing = BOOKING_PRODUCT_CORE_KEYS.filter((k) => pc[k] !== true);
    if (missing.length) {
      throw new Error(
        `productCore incomplete for booking stack; set true: ${missing.join(", ")}`,
      );
    }
  }
}

export function loadPreviousBrand(
  pathOrConfig: string | ClientConfig,
  explicitPath?: string,
): PreviousBrand {
  if (explicitPath) {
    return loadJson<PreviousBrand>(resolve(explicitPath));
  }
  if (typeof pathOrConfig === "string") {
    return loadJson<PreviousBrand>(resolve(pathOrConfig));
  }
  if (pathOrConfig.previousBrand) {
    return pathOrConfig.previousBrand;
  }
  throw new Error(
    "No previousBrand in config; pass --previous <tokens.json>",
  );
}

export function toolkitRoot(): string {
  return resolve(__dirname, "../..");
}

export function packageVersion(): string {
  try {
    const pkg = loadJson<{ version: string }>(
      join(toolkitRoot(), "package.json"),
    );
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}
