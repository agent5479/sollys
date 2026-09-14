import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import type {
  ClientConfig,
  EngagementAnswers,
  Features,
  Locale,
} from "./types.js";
import {
  DEFAULT_BRAND_ASSETS,
  defaultProductCoreForBooking,
} from "./types.js";
import { loadJson, packageVersion } from "./config/load.js";
import { writeText } from "./generate/index.js";

const PLACEHOLDER_COMMIT = "0000000000000000000000000000000000000000";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "client";
}

function localeFromGeoHint(hint?: string): Partial<Locale> {
  if (!hint) return {};
  const h = hint.toLowerCase();
  if (
    /new zealand|golden bay|auckland|wellington|christchurch|nelson|nz\b/.test(
      h,
    )
  ) {
    return {
      timeZone: "Pacific/Auckland",
      locale: "en-NZ",
      currency: "NZD",
      functionsRegion: "australia-southeast1",
    };
  }
  if (/australia|sydney|melbourne|au\b/.test(h)) {
    return {
      timeZone: "Australia/Sydney",
      locale: "en-AU",
      currency: "AUD",
      functionsRegion: "australia-southeast1",
    };
  }
  return {};
}

export function defaultDraftConfig(): ClientConfig {
  return {
    brand: {
      name: "TODO Brand Name",
      shortName: "TODO",
      contactName: "TODO Contact",
      contactRole: "Owner",
      contactBio: [],
      legalEntityName: "",
      copyrightText: "",
      notifyEmail: "todo@example.com",
      phone: "+64 00 000 0000",
      phoneHref: "tel:+64000000000",
      venues: [{ name: "TODO Venue", address: "TODO Address" }],
      origin: "https://www.example.com",
      appBase: "/app/",
      assets: { ...DEFAULT_BRAND_ASSETS },
    },
    style: {
      themeClass: "theme-todo",
      ink: "#1A1A1A",
      paper: "#F7F5F2",
      muted: "#6B6560",
      line: "#D9D2C9",
      accent: "#2F5D50",
      primary: "#2F5D50",
      secondary: "#6B6560",
      fonts: { display: "Fraunces", body: "Source Sans 3", source: "Google Fonts" },
    },
    language: {
      roleLabels: { admin: "Admin", trainer: "Staff", member: "Client" },
      classCatalog: [],
      paymentInstructions: "",
    },
    locale: {
      timeZone: "Pacific/Auckland",
      locale: "en-NZ",
      currency: "NZD",
      functionsRegion: "australia-southeast1",
      seasonModel: { mode: "manual", notes: "" },
    },
    infra: {
      firebaseProjectId: "todo-client-prod",
      hosting: { provider: "GitHub Pages" },
      aiCrawlerPolicy: {
        allowCitationBots: true,
        disallowTrainingBots: false,
        notes: "Allow AI citation/search bots unless intake says otherwise",
      },
      signInPath: "signin/",
      callableOrigins: [
        "https://www.example.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
      packageIdentity: {
        npmRoot: "studio",
        npmApps: "studio-apps",
        npmFunctions: "studio-functions",
        sharedAlias: "@studio/shared",
      },
    },
    seo: {
      siteTitle: "TODO Brand Name",
      siteDescription: "TODO site description",
      defaultOgImage: "/assets/og-default.jpg",
      routes: [
        {
          path: "/",
          title: "TODO Brand Name",
          description: "TODO site description",
        },
      ],
    },
    templateLineage: {
      upstreamCommit: PLACEHOLDER_COMMIT,
      toolkitVersion: packageVersion(),
      forkedAt: new Date().toISOString(),
    },
    features: {
      stack: "booking",
      surfaces: {
        marketing: true,
        memberApp: true,
        staffConsole: true,
        emailCalendar: true,
        manualPayments: true,
      },
      mPatterns: [],
      assumptionsAuthorized: false,
      infraBoundaryConfirmed: false,
    },
    productCore: defaultProductCoreForBooking(),
  };
}

export function applyEngagementAnswers(
  answers: EngagementAnswers,
  base?: ClientConfig,
): { config: ClientConfig; gaps: string[] } {
  const cfg = structuredClone(base ?? defaultDraftConfig());
  const gaps: string[] = [];

  const geoLocale = localeFromGeoHint(answers.geoHint);
  cfg.locale = { ...cfg.locale, ...geoLocale, ...(answers.locale ?? {}) };

  if (answers.brand) {
    cfg.brand = { ...cfg.brand, ...answers.brand } as ClientConfig["brand"];
    if (answers.brand.venues) cfg.brand.venues = answers.brand.venues;
  }

  if (!answers.brand?.name || answers.brand.name.startsWith("TODO")) {
    gaps.push("brand.name");
  }
  if (!answers.brand?.notifyEmail || answers.brand.notifyEmail.includes("todo@")) {
    gaps.push("brand.notifyEmail");
  }
  if (!answers.brand?.origin || answers.brand.origin.includes("example.com")) {
    gaps.push("brand.origin");
  }
  if (!answers.brand?.phone || answers.brand.phone.includes("000 0000")) {
    gaps.push("brand.phone");
  }

  if (answers.style) {
    cfg.style = { ...cfg.style, ...answers.style, fonts: {
      ...cfg.style.fonts,
      ...(answers.style.fonts ?? {}),
    } };
    if (answers.style.themeClass) cfg.style.themeClass = answers.style.themeClass;
  } else if (cfg.brand.shortName && cfg.brand.shortName !== "TODO") {
    cfg.style.themeClass = `theme-${slugify(cfg.brand.shortName)}`;
  }

  if (answers.infra) {
    cfg.infra = {
      ...cfg.infra,
      ...answers.infra,
      hosting: {
        ...cfg.infra.hosting,
        ...(answers.infra.hosting ?? {}),
      },
      aiCrawlerPolicy: {
        ...cfg.infra.aiCrawlerPolicy,
        ...(answers.infra.aiCrawlerPolicy ?? {}),
      },
    };
  }
  if (cfg.brand.shortName !== "TODO" && cfg.infra.firebaseProjectId.startsWith("todo-")) {
    cfg.infra.firebaseProjectId = `${slugify(cfg.brand.shortName)}-prod`;
  }

  if (answers.seo) {
    cfg.seo = {
      ...cfg.seo,
      ...answers.seo,
      routes: answers.seo.routes ?? cfg.seo.routes,
    };
  } else if (cfg.brand.name !== "TODO Brand Name") {
    cfg.seo.siteTitle = cfg.brand.name;
    cfg.seo.siteDescription =
      answers.industryNotes?.slice(0, 160) || `${cfg.brand.name} — official site`;
    cfg.seo.routes = [
      {
        path: "/",
        title: cfg.brand.name,
        description: cfg.seo.siteDescription,
      },
    ];
  }

  if (answers.language) {
    cfg.language = {
      ...cfg.language,
      ...answers.language,
      classCatalog: answers.language.classCatalog ?? cfg.language?.classCatalog ?? [],
      roleLabels: {
        ...(cfg.language?.roleLabels ?? {}),
        ...(answers.language.roleLabels ?? {}),
      },
    };
  }

  if (answers.terminology) {
    cfg.language = {
      ...cfg.language,
      roleLabels: {
        ...(cfg.language?.roleLabels ?? {}),
        ...Object.fromEntries(
          Object.entries(answers.terminology).filter(([k]) =>
            ["admin", "trainer", "member"].includes(k),
          ),
        ),
      },
    };
  }

  const features: Features = {
    stack: answers.stack,
    surfaces: answers.surfaces,
    mPatterns: answers.mPatterns ?? [],
    terminology: answers.terminology ?? {},
    assumptionsAuthorized: answers.assumptionsAuthorized ?? false,
    infraBoundaryConfirmed: answers.infraBoundaryConfirmed ?? false,
  };
  cfg.features = features;

  if (answers.stack === "booking" || answers.stack === "hybrid") {
    cfg.productCore = {
      ...defaultProductCoreForBooking(),
      ...(answers.productCore ?? {}),
    };
    // Narrow presentation roles from S2; keep shared/functions/rules/appsScript core true unless intake overrides.
    if (answers.surfaces?.marketing === false) cfg.productCore.marketing = false;
    if (answers.surfaces?.memberApp === false) cfg.productCore.memberApp = false;
    if (answers.surfaces?.staffConsole === false) {
      cfg.productCore.staffConsole = false;
    }
  }

  if (!cfg.brand.assets) {
    cfg.brand.assets = { ...DEFAULT_BRAND_ASSETS };
  }
  if (!cfg.infra.signInPath) cfg.infra.signInPath = "signin/";
  if (!cfg.infra.callableOrigins?.length) {
    cfg.infra.callableOrigins = [
      cfg.brand.origin,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];
  }
  if (!cfg.infra.packageIdentity) {
    const slug = slugify(cfg.brand.shortName);
    cfg.infra.packageIdentity = {
      npmRoot: slug === "todo" ? "studio" : slug,
      npmApps: slug === "todo" ? "studio-apps" : `${slug}-apps`,
      npmFunctions: slug === "todo" ? "studio-functions" : `${slug}-functions`,
      sharedAlias: slug === "todo" ? "@studio/shared" : `@${slug}/shared`,
    };
  }
  if (!cfg.locale.seasonModel) {
    cfg.locale.seasonModel = { mode: "manual", notes: "" };
  }

  if (answers.previousBrand) cfg.previousBrand = answers.previousBrand;
  if (answers.templateLineage) {
    cfg.templateLineage = {
      ...cfg.templateLineage,
      ...answers.templateLineage,
      upstreamCommit:
        answers.templateLineage.upstreamCommit ??
        cfg.templateLineage.upstreamCommit,
    };
  }

  if (!features.infraBoundaryConfirmed) {
    gaps.push("features.infraBoundaryConfirmed (S6)");
  }
  if (gaps.length && !features.assumptionsAuthorized) {
    gaps.push(
      "Authorize CLIENT_ASSUMPTIONS.md or fill gaps before execute (assumptionsAuthorized)",
    );
  }

  return { config: cfg, gaps };
}

export function writeClientConfig(path: string, config: ClientConfig): void {
  const abs = resolve(path);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function intakeInit(outPath: string): ClientConfig {
  const cfg = defaultDraftConfig();
  writeClientConfig(outPath, cfg);
  return cfg;
}

export function intakeApplyAnswers(opts: {
  answersPath: string;
  outPath: string;
  basePath?: string;
}): { config: ClientConfig; gaps: string[] } {
  const answers = loadJson<EngagementAnswers>(resolve(opts.answersPath));
  const base =
    opts.basePath && existsSync(opts.basePath)
      ? loadJson<ClientConfig>(resolve(opts.basePath))
      : undefined;
  const { config, gaps } = applyEngagementAnswers(answers, base);
  writeClientConfig(opts.outPath, config);
  return { config, gaps };
}

export function humanInfraChecklist(config?: ClientConfig): string[] {
  const origin = config?.brand.origin ?? "{{CLIENT_ORIGIN}}";
  const appBase = config?.brand.appBase ?? "/app/";
  const project = config?.infra.firebaseProjectId ?? "{{FIREBASE_PROJECT_ID}}";
  const host = (() => {
    try {
      return new URL(origin).hostname;
    } catch {
      return "your-domain.example";
    }
  })();

  return [
    `Firebase: create/use project ${project} (billing/login as needed)`,
    "Firebase Auth: enable Email/Password",
    `Firebase Auth: authorized domains include ${host}`,
    "Firebase: create web app; copy apiKey/appId into repo secrets / .env (do not commit secrets)",
    "Deploy rules/indexes/functions when source is ready: firebase deploy --only firestore:rules,firestore:indexes,functions",
    `Set Functions params: FORM_ENDPOINT, SIGN_IN_URL=${origin}${appBase}${config?.infra.signInPath ?? "signin/"}, CALLABLE_ORIGINS, TIME_ZONE`,
    "Set secret FUNCTIONS_WEBHOOK_SECRET (never commit the value)",
    "Apps Script: clasp login; push adapter; set Script Properties from generated template",
    "Calendar: create/share calendar; set CALENDAR_ID Script Property",
    "Apps Script web app: Execute as Me, access Anyone; copy /exec → FORM_ENDPOINT + VITE_FORM_ENDPOINT",
    "CI/hosting: inject VITE_FIREBASE_* + VITE_FORM_ENDPOINT; reject placeholders",
    "DNS/CNAME + SSL for custom domain",
    "CDN/WAF: allow AI citation bots if intake wants GEO visibility (not only robots.txt)",
    "Optional: wl provision --dry-run once CLI login is ready",
  ];
}

export function loadAnswersFile(path: string): EngagementAnswers {
  return loadJson<EngagementAnswers>(resolve(path));
}

/** Merge role labels from features.terminology into language for generate */
export function syncTerminologyToLanguage(config: ClientConfig): ClientConfig {
  if (!config.features?.terminology) return config;
  const next = structuredClone(config);
  next.language = {
    ...next.language,
    roleLabels: {
      ...(next.language?.roleLabels ?? {}),
      ...Object.fromEntries(
        Object.entries(config.features.terminology).filter(([k]) =>
          ["admin", "trainer", "member"].includes(k),
        ),
      ),
    },
  };
  return next;
}

export function writeAssumptionsStub(
  path: string,
  gaps: string[],
  industryNotes?: string,
): void {
  const body = `# Client assumptions

Authorized gaps for execute (human confirmed). Fill or remove as real intake arrives.

${industryNotes ? `## Industry notes\n\n${industryNotes}\n\n` : ""}## Gaps

${gaps.map((g) => `- ${g}`).join("\n")}
`;
  writeText(path, body);
}

export function readOptionalConfig(path: string): ClientConfig | undefined {
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf8")) as ClientConfig;
}
