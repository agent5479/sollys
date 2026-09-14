import type { ClientConfig, HostMap } from "../types.js";
import { DEFAULT_BRAND_ASSETS } from "../types.js";

/**
 * Post-interview apply aid. Subordinate to §L3 S1–S6 engagement protocol —
 * does not replace stack/surfaces relevance checks.
 */
export function generateRebrandPrompt(cfg: ClientConfig): string {
  const assets = cfg.brand.assets ?? DEFAULT_BRAND_ASSETS;
  return `# Client Rebranding Execution System

You are a codebase customization bot. Your task is to apply Client Pack intake to a host Product Core **after** the §L3 engagement interview (S1–S6) has selected stack, surfaces, and add-ons.

## Preconditions
1. Engagement answers and an approved in-repo plan already exist.
2. Do **not** invent themed catalog, founder bio, or regional term tables — only use Client Pack slots the human filled.
3. Surfaces marked N/A in S2 stay out of scope.

## Instructions
1. Prompt the user for any missing details from the Client Profile below if they did not provide them in their initial input.
2. Update the host brand module / \`client.config\` slots with metadata, copy, and color HEX codes from intake.
3. Update key visual variables (theme CSS / CSS variables) to align with the chosen colors.
4. Replace placeholder assets copied from the toolkit \`templates/brand/\` into the host \`public/brand/\` (or paths in Client Pack \`brand.assets\`).
5. Update package.json names / shared alias from \`infra.packageIdentity\`, and HTML/SEO metadata.
6. Wire CORS (\`callableOrigins\`), \`SIGN_IN_URL\`, Firebase project id, and timezone from intake — do not hardcode a prior studio.
7. Seed catalog/pricing/slots with **client** data only (empty skeleton until filled); bootstrap admin claim.
8. Run a final sanity check across the codebase to ensure no previous-brand scrub tokens remain hardcoded.

## Client Profile Schema
Please provide or confirm the following client details:
- *Client / Product Name:* ${cfg.brand.name.startsWith("TODO") ? "" : cfg.brand.name}
- *Tagline:* ${cfg.brand.tagline ?? ""}
- *Primary Brand Color (HEX):* ${cfg.style.primary ?? cfg.style.accent}
- *Secondary Brand Color (HEX):* ${cfg.style.secondary ?? cfg.style.muted}
- *Accent Color (HEX):* ${cfg.style.accent}
- *Support Email:* ${cfg.brand.notifyEmail.includes("todo@") || cfg.brand.notifyEmail.includes("example.com") ? "" : cfg.brand.notifyEmail}
- *Domain / Hostname:* ${cfg.brand.origin.includes("example.com") ? "" : cfg.brand.origin}
- *Legal Entity Name:* ${cfg.brand.legalEntityName ?? ""}
- *Logo Asset (URL / Path / Description):* ${assets.logoLight}
- *Coach / Founder Name & Bio:* (fill at engagement; \`contactBio\` starts empty)
- *Phone (display + E.164):*
- *Social links:*
- *Primary venue name, address, lat/lng:*
- *Timezone (IANA):* ${cfg.locale.timeZone}
- *Marketing origin URL + app path:* ${cfg.brand.origin} + ${cfg.brand.appBase}
- *Firebase project id + region:* ${cfg.infra.firebaseProjectId} / ${cfg.locale.functionsRegion}
- *Authorized Auth domains / CORS origins:*
- *Apps Script web app URL (FORM_ENDPOINT):*
- *Bank / payment instructions:* (Client Pack \`language.paymentInstructions\` — ledger model, not a card gateway)
- *Default class offerings:* (empty \`classCatalog\` until engagement; no licensed names unless acknowledged)
- *Season / term calendar mode:* ${cfg.locale.seasonModel?.mode ?? "manual"} (\`termCalendar\` | \`customRanges\` | \`manual\` — no regional tables in toolkit)
- *npm package / shared alias:* ${cfg.infra.packageIdentity?.npmRoot ?? "studio"} / ${cfg.infra.packageIdentity?.sharedAlias ?? "@studio/shared"}

## In-kit asset sources (toolkit self-contained)
- logo-light: \`${assets.logoLight}\`
- logo-dark: \`${assets.logoDark}\`
- favicon: \`${assets.favicon}\`
- app-icon: \`${assets.appIcon}\`
`;
}

export function generateSeedSkeleton(): string {
  return `${JSON.stringify(
    {
      classTypes: [],
      pricingPlans: [],
      timetableSlots: [],
      _note:
        "Fill at engagement only. Toolkit ships empty structure — no studio class names or licensed programs.",
    },
    null,
    2,
  )}\n`;
}

export function generateSeedsReadme(): string {
  return `# Seed skeleton

Structural placeholder for host seed scripts.

- Keep Product Core seed **scripts** brand-free.
- Fill \`catalog.seed.json\` (and host seed runners) with **client** data at engagement.
- Do not ship licensed program names unless intake sets \`licensed: true\` and \`licensedCatalogAcknowledged\`.
- The toolkit never embeds regional term calendars or vertical class catalogs as defaults.
`;
}

export function generateBrandAssetsReadme(): string {
  return `# Brand asset placeholders (in-kit)

These files live inside \`@whitelabel/pivot-kit\` so the multiproject folder is **complete unto itself**.
Do not reference assets from any live host product tree.

| File | Role |
|------|------|
| \`logo-light.svg\` | Neutral mark for light backgrounds |
| \`logo-dark.svg\` | Neutral mark for dark backgrounds |
| \`favicon.ico\` | Generic favicon placeholder |
| \`app-icon.png\` | Generic app icon placeholder |

At engagement, copy into the host \`public/brand/\` (or paths in \`brand.assets\`) and replace with client artwork.
`;
}

export function buildManifest(
  cfg: ClientConfig,
  files: string[],
  hostMap?: HostMap,
): string {
  const assets = cfg.brand.assets ?? DEFAULT_BRAND_ASSETS;
  return (
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        brand: cfg.brand.shortName,
        firebaseProjectId: cfg.infra.firebaseProjectId,
        inKitAssets: assets,
        hostMap: hostMap ?? null,
        files,
        note: "Apply aid after §L3 interview; toolkit assets are self-contained.",
      },
      null,
      2,
    ) + "\n"
  );
}
