/** Client Pack intake — mirrors schemas/client.config.schema.json */

export interface Venue {
  name: string;
  address: string;
  geo?: { lat: number; lng: number };
}

/** In-kit / host-relative brand asset path contract (structural only). */
export interface BrandAssets {
  logoLight: string;
  logoDark: string;
  favicon: string;
  appIcon: string;
  logoWidth?: number;
  logoHeight?: number;
}

export interface Brand {
  name: string;
  shortName: string;
  tagline?: string;
  hashtag?: string;
  voice?: string;
  voiceSamples?: string[];
  contactName: string;
  contactRole: string;
  /** Intake slot — empty until engagement fills it. */
  contactBio?: string[];
  legalEntityName?: string;
  copyrightText?: string;
  notifyEmail: string;
  phone: string;
  phoneHref: string;
  social?: Record<string, string>;
  venues: Venue[];
  origin: string;
  appBase: string;
  assets?: BrandAssets;
}

export interface Style {
  themeClass: string;
  ink: string;
  paper: string;
  muted: string;
  line: string;
  accent: string;
  /** Optional token slots; generate maps to CSS variables. */
  primary?: string;
  secondary?: string;
  fonts: { display: string; body: string; source?: string };
  radii?: string;
  motion?: string;
  logoPath?: string;
  ogImagePath?: string;
  iconApproach?: string;
}

export interface ClassCatalogItem {
  id: string;
  name: string;
  blurb: string;
  /** When true, intake must acknowledge licensed IP. */
  licensed?: boolean;
}

export interface Language {
  uiStringsPath?: string;
  emailCopyPath?: string;
  roleLabels?: Record<string, string>;
  paymentInstructions?: string;
  classCatalogPath?: string;
  /** Structural catalog slot — default empty; fill at engagement only. */
  classCatalog?: ClassCatalogItem[];
  /** Required when any classCatalog item has licensed: true. */
  licensedCatalogAcknowledged?: boolean;
}

export type SeasonMode = "termCalendar" | "customRanges" | "manual";

export interface SeasonRange {
  label: string;
  start: string;
  end: string;
}

export interface SeasonModel {
  mode: SeasonMode;
  notes?: string;
  ranges?: SeasonRange[];
}

export interface Locale {
  timeZone: string;
  locale: string;
  currency: string;
  functionsRegion: string;
  operatingHours?: string;
  seasonsNotes?: string;
  seasonModel?: SeasonModel;
}

export interface PackageIdentity {
  npmRoot: string;
  npmApps?: string;
  npmFunctions?: string;
  sharedAlias: string;
}

export interface Infra {
  googleAccount?: string;
  calendarStrategy?: string;
  firebaseProjectId: string;
  hosting: {
    provider: string;
    customDomain?: string;
    dnsOwner?: string;
  };
  aiCrawlerPolicy?: {
    allowCitationBots?: boolean;
    disallowTrainingBots?: boolean;
    notes?: string;
  };
  /** Path segment under appBase for sign-in (default signin/). */
  signInPath?: string;
  /** Callable CORS origins; default derived from brand.origin + localhost. */
  callableOrigins?: string[];
  packageIdentity?: PackageIdentity;
}

/**
 * Machine-checkable Product Core roles for booking stack.
 * Applied only to surfaces selected in engagement S2 — not a substitute for the interview.
 */
export interface ProductCore {
  marketing?: boolean;
  memberApp?: boolean;
  staffConsole?: boolean;
  sharedClient?: boolean;
  functions?: boolean;
  firestoreRules?: boolean;
  firestoreIndexes?: boolean;
  rulesTests?: boolean;
  appsScript?: boolean;
  seedScripts?: boolean;
  adminBootstrap?: boolean;
  pagesAssemble?: boolean;
}

export interface SeoRoute {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}

export interface Seo {
  siteTitle: string;
  siteDescription: string;
  defaultOgImage: string;
  twitterHandle?: string;
  routes: SeoRoute[];
}

export interface TemplateLineage {
  upstreamRepo?: string;
  upstreamCommit: string;
  toolkitVersion?: string;
  forkedAt?: string;
}

export interface PreviousBrand {
  tokens?: string[];
  domains?: string[];
  emails?: string[];
  phones?: string[];
  themeClass?: string;
  prodIdDomain?: string;
  fingerprintHexes?: string[];
  allowPaths?: string[];
}

export interface FeatureSurfaces {
  marketing?: boolean;
  memberApp?: boolean;
  staffConsole?: boolean;
  emailCalendar?: boolean;
  manualPayments?: boolean;
}

export interface Features {
  stack?: "booking" | "publicSheetCalendar" | "hybrid";
  surfaces?: FeatureSurfaces;
  mPatterns?: string[];
  terminology?: Record<string, string>;
  assumptionsAuthorized?: boolean;
  infraBoundaryConfirmed?: boolean;
}

export interface ClientConfig {
  brand: Brand;
  style: Style;
  language?: Language;
  locale: Locale;
  infra: Infra;
  seo: Seo;
  templateLineage: TemplateLineage;
  features?: Features;
  productCore?: ProductCore;
  previousBrand?: PreviousBrand;
  adminBootstrap?: { email?: string; uid?: string };
}

/** §L3 interview dump — input to `wl intake apply-answers` */
export interface EngagementAnswers {
  stack: "booking" | "publicSheetCalendar" | "hybrid";
  surfaces: FeatureSurfaces;
  mPatterns?: string[];
  terminology?: Record<string, string>;
  brand?: Partial<Brand> & {
    name?: string;
    shortName?: string;
  };
  style?: Partial<Style>;
  locale?: Partial<Locale>;
  language?: Partial<Language>;
  infra?: Partial<Infra> & {
    firebaseProjectId?: string;
    hosting?: Infra["hosting"];
  };
  seo?: Partial<Seo>;
  productCore?: Partial<ProductCore>;
  industryNotes?: string;
  geoHint?: string;
  assumptionsAuthorized?: boolean;
  infraBoundaryConfirmed?: boolean;
  previousBrand?: PreviousBrand;
  templateLineage?: Partial<TemplateLineage>;
}

/** Host Product Core path roles — discovery only; no themed content. */
export interface HostMap {
  marketing?: string;
  apps?: string;
  shared?: string;
  functions?: string;
  appsScript?: string;
  rules?: string;
  indexes?: string;
  rulesTests?: string;
  seedScripts?: string;
  ciWorkflow?: string;
  staticRoot?: string;
}

/** Default in-kit asset paths (toolkit-local templates/brand/). */
export const DEFAULT_BRAND_ASSETS: BrandAssets = {
  logoLight: "templates/brand/logo-light.svg",
  logoDark: "templates/brand/logo-dark.svg",
  favicon: "templates/brand/favicon.ico",
  appIcon: "templates/brand/app-icon.png",
  logoWidth: 48,
  logoHeight: 48,
};

export function defaultProductCoreForBooking(): ProductCore {
  return {
    marketing: true,
    memberApp: true,
    staffConsole: true,
    sharedClient: true,
    functions: true,
    firestoreRules: true,
    firestoreIndexes: true,
    rulesTests: true,
    appsScript: true,
    seedScripts: true,
    adminBootstrap: true,
    pagesAssemble: true,
  };
}
