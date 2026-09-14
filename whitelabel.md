---
title: White-Label Project Prompt
purpose: Single self-contained project prompt for unique-client deployments—booking Product Core (§§A–L) plus optional reusable assessment, ops, UX, showcase, CI, and Calendar/Sheet patterns (§M). No external playbooks required.
---

# White-Label Project Prompt

You are the delivery agent for a **white-label project**. This file is the **entire** construction brief. Do not require sibling guides, replication docs, or other repos to execute it.

### Self-containment & transfer rule

- **All contracts live here.** §§A–L and §M are complete: surfaces, flows, env **names**, SEO, provisioning, and patterns use When / Invariants / Build / Acceptance—not “open sibling doc X” and not “that file must exist at path Y.”
- **Discover, don’t assume paths.** On engagement, map this prompt’s *roles* (marketing site, member app, staff console, shared widgets, callables, rules, mail/calendar adapter) onto whatever directories the hosting repo actually uses. If a booking surface is absent, mark that subsection N/A.
- **When you copy this file into another project:** (1) keep contracts intact, (2) do not reintroduce foreign file paths or sibling playbooks, (3) optionally add a short local appendix of *this* repo’s path map only if helpful—never required to execute the prompt.

### Families

- **§§A–L** — Booking Product Core (marketing + member booking + staff console + Firebase + Apps Script email/calendar). Use for studio/booking pivots.
- **§M** — Optional Product Core patterns (allocation, engines, scoring, ops/UX, showcase, CI gates, terminology, Calendar/Sheet stack). Apply **only** when needed; keep brand-free.

Produce a **complete, client-unique instance**—not a cosmetic tweak of a prior brand. Brand, style, and language come from intake. Product math/RBAC/sync stays brand-free.

Stop when §J passes (booking). When §M is in scope, also pass each selected subsection’s acceptance list.

---

## A. Mission, constraints, and done

### Mission

Deliver a production-ready white-label deployment of this stack for one client business entity, with:

1. A filled **Client Pack** (identity, tokens, copy, SEO, locale, domains, secrets wiring).
2. Product Core preserved (callables, rules, widgets, data contracts).
3. Fresh or correctly re-bound Firebase + Apps Script + DNS/hosting for that client.
4. Zero leakage of any previous project’s brand strings, colors-as-identity, domains, founder names, or email copy.

### Hard constraints

- **True white-label.** Never treat the template repo’s current studio name, short code, phone, email, domain, venue, founder voice, palette, or SEO geo as defaults to “search-and-replace lightly.” Build the Client Pack from intake; apply it deliberately.
- **Themed content never enters Product Core or toolkit defaults.** Class names, founder bios, regional term tables, licensed program names, and studio copy live only in Client Pack slots **after** engagement intake. Toolkit generators emit empty structures and in-kit neutral placeholders only.
- **Product Core stays brand-free.** Booking capacity, claims, transfer windows, season generation, and roster rules must not encode client marketing voice.
- **Toolkit self-contained.** `@whitelabel/pivot-kit` ships every file it references (schema, fixtures, `templates/brand/` placeholders). Do not depend on a live host product tree’s assets.
- **Engagement protocol (§L3) is mandatory.** Plan mode → S1–S6 relevance checks (stack → surfaces → add-ons → terminology → brand gaps → infra boundary) before coding. Generated `REBRAND_PROMPT.md` is a post-interview apply aid only — it does not replace S1–S6.
- **Firestore is source of truth.** Google Calendar is a push-only downstream mirror. Do not read calendar state back into the product for attendance or capacity.
- **Members are not calendar guests** on the shared studio calendar (privacy). Per-member ICS goes to that member only.
- **Auth** is email/password + custom claims. Do not reintroduce Google Sign-In unless the client explicitly requires it and you update §G env/secrets inventory accordingly.
- **One Firebase project per client** (current architecture). Do not invent multi-tenant shared-DB unless the human explicitly changes scope.
- **Payments** are ledger / bank instructions via Client Pack (`language.paymentInstructions` → site content), not a card gateway unless explicitly requested.

### Non-goals (unless explicitly requested)

- Packaging this file as a Cursor Skill under `.cursor/skills/`.
- Multi-tenant single Firebase with org IDs.
- Payment gateway (template uses manual bank reconcile / admin flags).
- SMS providers (template has email + ICS only).

**Toolkit note:** The sibling `@whitelabel/pivot-kit` package (`wl` CLI) is **acceleration execution**, not a required sibling playbook. Contracts in this file remain authoritative and self-contained; when the toolkit is present, prefer its commands for intake, generate, brand/SEO gates, provision, E2E smoke, and cutover.

### Definition of done

- [ ] Client Pack complete and applied across marketing, apps, Functions params, Apps Script, assets, SEO.
- [ ] Fresh identity: domain, Auth authorized domains, CORS origins, sign-in continue URL.
- [ ] Rules, indexes, and functions deployed; seeds and bootstrap admin claim done.
- [ ] E2E matrix (§J) green — satisfied by `wl e2e` smoke (+ `wl e2e --full` when deployed).
- [ ] Repo-wide grep for previous brand tokens returns no user-facing hits — `wl check-brand`.
- [ ] SEO/metadata smoke (§H) green for the marketing origin — `wl check-seo` / generated SEO pack.

---

## B. Client intake (required before coding)

Do **not** start re-skinning or provisioning until the following is answered or explicitly deferred with a written assumption.

**Preferred intake (machine-readable):** a single `client.config.json` conforming to the toolkit schema (`schemas/client.config.schema.json`). Validate with `wl validate --config client.config.json` before coding. The tables below remain the **field glossary** and human checklist; every required B1–B5 field maps into that schema (plus `templateLineage`, optional `previousBrand`, `seo`).

### B1. Brand identity

| Field | Placeholder | Notes |
|-------|-------------|-------|
| Legal / display name | `{{BRAND_NAME}}` | Full public name |
| Short name | `{{BRAND_SHORT}}` | Nav mark, email subjects, calendar titles |
| Legal entity / copyright | `legalEntityName` / `copyrightText` | Schema slots; empty until intake |
| Tagline / hashtag | `{{TAGLINE}}` / `{{HASHTAG}}` | Optional |
| Voice & tone | free text + 2–3 sample sentences | UI, emails, about copy |
| Primary contact name/role | `{{CONTACT_NAME}}` / `{{CONTACT_ROLE}}` | Founder/coach/owner |
| Contact bio paragraphs | `contactBio[]` | Empty array until engagement fills it |
| Email | `{{NOTIFY_EMAIL}}` | Inbox + public contact |
| Phone + `tel:` href | `{{PHONE}}` / `{{PHONE_HREF}}` | |
| Social URLs | `{{SOCIAL_*}}` | Only channels that exist |
| Venues | list of name + address + geo | Drive map/JSON-LD |
| Origin | `{{CLIENT_ORIGIN}}` | `https://…` no trailing slash |
| App base path | `{{APP_BASE}}` | Template default `/app/` |
| Brand assets | `brand.assets` | Paths to toolkit `templates/brand/` placeholders; copy to host `public/brand/` at engagement |

### B2. Style

| Field | Placeholder |
|-------|-------------|
| Theme class name | `{{THEME_CLASS}}` e.g. `.theme-acme` |
| Ink / paper / muted / line / accent | hex tokens |
| Primary / secondary | optional hex slots → `--wl-primary` / `--wl-secondary` |
| Display + body fonts | with license/source (self-host or Google Fonts) |
| Radii, motion, section treatment | mobile cards vs square marketing |
| Logo (SVG/PNG), favicon set, OG image(s) | file deliverables (start from in-kit placeholders) |
| Icon approach | currentColor inline SVG vs icon set |

### B3. Language & product wording

| Field | Notes |
|-------|-------|
| UI string inventory | Sign-in, hub cards, booking CTAs, empty states, errors |
| Email/ICS subjects & bodies | Invite, broadcast default, payment reminder, guest pass, reschedule |
| Legal: terms + waiver | Stored in `siteContent` and/or Client Pack |
| Payment instructions | Bank details / copy for members (ledger model) |
| Role labels in UI | Claims stay `admin` / `trainer` / `member`; display names may differ |
| Class / service catalog | `language.classCatalog[]` shape — **default empty**; fill at engagement. `licensed: true` requires `licensedCatalogAcknowledged` |

### B4. Locale & operations

| Field | Placeholder | Notes |
|-------|-------------|-------|
| IANA timezone | `{{TZ}}` | From intake / geo hint — not a themed default |
| BCP 47 locale | `{{LOCALE}}` | e.g. `en-NZ`, `en-AU` |
| Currency display | `{{CURRENCY}}` | Store cents; format locale-aware |
| Operating hours | free text | Feeds timetable + closures |
| Season model | `seasonModel.mode` | `termCalendar` \| `customRanges` \| `manual` — **no regional term tables in toolkit** |
| Functions region | `{{FUNCTIONS_REGION}}` | e.g. `australia-southeast1` |

### B5. Google / Firebase / hosting

| Field | Notes |
|-------|-------|
| Google account that owns Apps Script + Calendar | Execute-as Me |
| Shared calendar strategy | New calendar vs existing; public subscribe? |
| Firebase project id | `{{FIREBASE_PROJECT_ID}}` |
| Sign-in path | `infra.signInPath` (default `signin/`) |
| Callable CORS origins | `infra.callableOrigins` |
| Package identity | `infra.packageIdentity` — npm names + shared alias placeholders |
| Hosting provider / custom domain / DNS owner | |
| AI crawler policy | optional |

### B5b. Product Core inventory (`productCore`)

Required when `features.stack` is `booking` or `hybrid`. Applied **after** S2 surface selection — does not replace the interview. Flags: marketing, memberApp, staffConsole, sharedClient, functions, firestoreRules, firestoreIndexes, rulesTests, appsScript, seedScripts, adminBootstrap, pagesAssemble.

**Structural HostMap roles** (discovery): marketing, apps, shared, functions, appsScript, rules, indexes, rulesTests, seedScripts, ciWorkflow, staticRoot. Booking residuals must resolve shared, functions, rules, appsScript, seedScripts.

### B6. Intake gate

**Planning is allowed with gaps.** Missing B1–B5 fields do not block the kickoff interview (§L3 / Kickoff). During planning, collect residuals in interview step S5.

**Execute gate:** Before coding / `wl generate` / provision, either (1) required fields are complete and `wl validate` passes, or (2) the human authorizes proceeding with gaps and a short `CLIENT_ASSUMPTIONS.md` is written in the client fork.

When using the toolkit: dump interview results with `wl intake apply-answers`, then `wl validate` before generate. Do not write live secret **values** into the repo.

---

## C. Architecture and data-flow map

Booking Product Core is a **capability map**. Locate equivalent modules in the hosting repo; do not require any particular filename.

### C1. Surfaces

| Surface | Role |
|---------|------|
| Marketing site | Public home, contact, public timetable |
| Member app | Hub entry, sign-in, member booking (week calendar, locks, drop-ins) |
| Staff console | Schedule, seasons, members/payments, accounts, legal/site content, notify |
| Shared client kit | Calendar/slot widgets, date/time pickers, live Firestore readers, auth/claim helpers |
| Cloud backend | HTTPS callables + Firestore triggers (booking region as configured) |
| Mail/calendar adapter | Apps Script (or equivalent) `doPost` webhook for email + shared calendar |
| Security rules + indexes | Three-tier RBAC and query indexes |
| Static hosting / CI | Marketing + apps publish; secrets injected at build |

### C2. Roles (claims)

Canonical Auth custom claims (enforce in rules + callables; UI may relabel via Client Pack / §M23):

| Claim | Product meaning | Primary UI |
|-------|-----------------|------------|
| `admin` | Full studio control | Staff console (all tabs) |
| `trainer` | Elevated staff substitute (`substitute` legacy alias OK) | Staff console (restricted) |
| `member` | Regular client | Member booking app |

Member **status** (profile, separate from role): `pending` | `active` | `suspended`.

**Enforcement (locate in-repo):** client claim reader; callable gates `requireAdmin` / `requireStaff` / `requireActiveMember` (or equivalents); rules helpers `isAdmin` / `isTrainer` / `isStaff`; one-shot admin-claim bootstrap via Admin SDK.

### C3. Data flows

```text
Public timetable
  Visitor → public schedule UI → live sessions / class types (public read)
  CTA → member app for booking

Member drop-in / one-off book
  Member UI → bookSession callable
    → sessions/{id}/roster/{uid} + bookedCount++
    → roster write trigger → adapter sendBookingInvite | sendBookingCancellation (ICS to that member)

Member weekly lock
  Member UI → lockWeeklySlot
    → users/{uid}/weeklyLocks/{slotId}
    → fans out roster with inviteSuppressed: true (trigger skips those)
    → callable sends sendSlotInvite (RRULE series)
  Unlock → unlockWeeklySlot → sendSlotCancellation

Staff schedule / season generate
  Staff UI → session writes or generateSeasonSessions
    → session write trigger (schedule fields only) → calendarUpsert / calendarDelete
    → calendarEventId stored on session

Contact form
  Marketing form → POST form endpoint → adapter action enquiry
    (public; mails NOTIFY_EMAIL only — never an open relay)
```

**Invariant:** Backend calls the adapter with `FORM_ENDPOINT` (or equivalent) and body field `webhookSecret` matching `FUNCTIONS_WEBHOOK_SECRET`. Prefer `Content-Type: text/plain` when the adapter is Apps Script (custom headers are unreliable).

### C4. Callable inventory (preserve behavior)

Admin: `createMemberAccount`, `resendInvite`, `adminResetPassword`, `approveMember`, `setMemberRole`, `generateSeasonSessions`, `calculateBillingPeriod`, `markBillingPeriodPaid`, `sendBroadcast`, `createGuestPass`, `resolvePlanChange`.

Staff: `markAttendance`, `addMemberToSession`, `removeSession`.

Member: `bookSession`, `cancelBooking`, `lockWeeklySlot`, `unlockWeeklySlot`, `lockSessionWeek`, `releaseSessionWeek`, `requestPlanChange`.

Signed-in: `projectSeasonInvoice`, `getCalendarSubscribeUrl`.

Triggers: roster write → member ICS; session schedule write → shared calendar upsert/delete.

---

## D. Code layering (mandatory)

Preserve or introduce this layering. When you touch code, move brand out of the wrong layer.

| Layer | Owns | Must not contain |
|-------|------|------------------|
| **Client Pack** | Brand config, theme class, assets, SEO meta/JSON-LD, email copy strings, CORS/domain lists, locale/TZ/currency display | Booking math, claim checks, capacity rules |
| **Presentation** | Marketing layout, app chrome, hub cards, page composition | Secrets, Auth claim enforcement |
| **Domain UI** | Member booking, staff console, sign-in flows | Hardcoded brand names, phones, domains |
| **Shared kit** | Week/season calendars, date/time pickers, live readers, auth wrappers | Client-specific marketing copy |
| **Backend** | Callables, triggers, billing/season math | Brand voice (pass display URLs/strings via params/config) |
| **Adapters** | Email/calendar formatting | Capacity, RBAC, invoice calculation |

### D1. Brand leakage audit (every pivot)

Grep and centralize into Client Pack—do not leave duplicates:

- Marketing brand/venue config modules
- Apps chrome (nav, footer, exit links, hub/sign-in copy)
- Backend callable CORS allowlist, default sign-in continue URL, hardcoded timezone
- Adapter subjects, venue defaults, ICS `PRODID`, UID domain, manage-booking URLs, default notify email
- HTML heads, web manifests, custom-domain / CNAME files, OG/canonical tags

### D2. Acceleration preference (when editing code)

Prefer one shared brand module imported by marketing **and** apps. Drive TZ, CORS origins, and sign-in continue URL from env/params. Keep adapter display strings in Script Properties (or a small brand map)—not scattered literals.

When the toolkit is available: `wl generate` emits the shared brand module, theme CSS, env examples, and Script Properties map from `client.config.json`.

### D3. Template lineage (across client forks)

Each client fork records Product Core provenance in `client.config.json` → `templateLineage`:

| Field | Purpose |
|-------|---------|
| `upstreamCommit` | Git SHA of Product Core at fork time (required) |
| `upstreamRepo` | Optional remote URL |
| `toolkitVersion` | Pivot-kit version used |
| `forkedAt` | ISO timestamp |

**Backport workflow:** diff the host against `upstreamCommit`, apply the core fix/security patch, run `wl check-brand` (+ targeted tests). If brand-leak and targeted tests pass, bump lineage with `wl lineage stamp --commit <newSha>` — do **not** require a full manual brand re-audit solely because core changed.

---

## E. Database structuring

### E1. Tenancy model

**One Firebase project per client.** Deploy rules/indexes/functions; seed client content. Do not share production data across brands.

### E2. Content vs schema

| Kind | Examples | White-label action |
|------|----------|--------------------|
| **Schema** | Collection shapes, roster fields, claims, callable contracts | Keep compatible; migrate carefully if changed |
| **Content** | Class names, prices, CMS `siteContent`, venues, hero blurbs | Replace per client |
| **Secrets / IDs** | Project id, calendar id, webhook URL | New per client |

### E3. Collection map (write authority)

Enforce in security rules (collection names may vary slightly; preserve authority):

| Path | Typical access |
|------|----------------|
| `catalog/**`, `classTypes`, `exercises` | Public read; admin write |
| `timetableSlots` | Public read; staff write |
| `sessions` | Public read; staff create/update; **no client delete** (use callable) |
| `sessions/{id}/roster/{uid}` | Owner/staff read; **staff write only** (members via callables) |
| `siteContent` | Public read; admin write |
| `users/{uid}` | Owner/staff read; self-create pending; restricted self-edit; admin delete |
| `users/.../weeklyLocks`, `bookings` | Owner/staff read; server/staff writes |
| `users/.../billingPeriods`, `calendarSeries` | Server-only writes |
| `seasons` | Signed-in read; admin write |
| `pricing`, `pricingPlans`, `pricingDiscounts` | Signed-in read; admin write |
| `meta` / settings / calendar subscribe cache | Staff / signed-in as coded |
| `planChangeRequests`, `guestPasses`, `audit`, `outbox` | Callable/server |

CMS document (commonly `siteContent/current`) holds client language: hero blurb, schedule narrative, contact display, payment instructions, terms, waiver.

### E4. Indexes, rules tests, seeds

- Deploy composite indexes with every pivot.
- Keep/update rules unit tests when rules change.
- Seed pricing/classes/slots only with **client** values—or seed empty and enter via staff UI.

### E5. Bootstrap

1. Create Firebase project `{{FIREBASE_PROJECT_ID}}`.
2. Enable Email/Password Auth.
3. Deploy rules, indexes, functions (region `{{FUNCTIONS_REGION}}`).
4. Bootstrap admin claim via Admin SDK.
5. Approve first members through product flows—not casual claim edits.

---

## F. UI/UX, style, and CSS reuse

### F1. Design tokens

Prefer CSS custom properties (no requirement for Tailwind). Token surfaces:

| Concern | Typical tokens |
|---------|----------------|
| Marketing + apps roots | `--ink`, `--paper`, `--muted`, `--line`, `--accent`, spacing, fonts |
| Motion | `--motion-fast` / `--motion-med` / `--motion-slow` |
| Client theme class | `.{{THEME_CLASS}}` overrides live product look |
| Shared widgets | Calendar grid, season grid, field popovers, class cards—variable-driven only |

**Procedure:**

1. Author `.{{THEME_CLASS}}` with client hex/type/radii/bevels/success-error.
2. Apply that class on all live marketing and app shells; remove any prior theme class names.
3. Align marketing `:root` with the same token language (or shared import).
4. Load client fonts; drop unused font links.
5. Do **not** fork widget structure for color—override variables.

### F2. CSS reuse rules

- Widget CSS uses tokens—not client hex literals.
- Client theme owns hex and type. Shared widgets own layout/state classes (`is-selected`, `is-held`, `is-locked`, `is-full`, etc.).
- Ignore or delete unused demo theme packs unless deliberately adopted.
- One composition language per surface; no second design system mid-pivot.

### F3. Layout catalog

| Surface | Structure |
|---------|-----------|
| Marketing | Header/nav/footer; public timetable; contact |
| Hub | Role-aware entry cards |
| Member booking | App chrome → week calendar → booking detail |
| Staff console | Horizontal tabs (not sidebar): schedule, seasons, members, accounts, legal, notify, … |
| Sign-in | Shared form; route by role |
| Presentation modes | Embed/standalone hide marketing chrome—not a brand system |

### F4. Custom widgets (re-theme; don’t rewrite)

| Capability | Notes |
|------------|-------|
| Week session calendar | Modes: `public` \| `member` \| `admin`; badge states selected/held/locked/full |
| Week navigator | Prev/next/this-week |
| Season / holiday calendar | Day or range selection |
| Date / time fields | Popover pickers; keyboard accessible |
| Working overlay | working → success → dismiss |
| Role-call overlay / roster | Staff attendance |
| Chips / badges | Selection, held, locked, full, pending |
| Allocation sliders / range touch guard | **§M1**, **§M5** — re-theme labels/CSS only |

Layout variants only when brand requires structural change. Otherwise tokens + copy.

### F5. Language application

- No leftover prior-brand voice in UI source.
- Marketing strings from Client Pack.
- Operational/legal/payment copy from CMS `siteContent` where the product already uses it.
- Email/ICS language from adapter properties/templates—not leftover prior-brand subjects (e.g. avoid “{{OLD_BRAND}} enquiry”).

---

## G. Variables, assets, and environment audit

### G1. Env and secret **names** (values are per-client)

**Client build (Vite or equivalent)**

| Name | Used for |
|------|----------|
| `VITE_FIREBASE_API_KEY` | Web SDK |
| `VITE_FIREBASE_AUTH_DOMAIN` | Web SDK |
| `VITE_FIREBASE_PROJECT_ID` | Web SDK |
| `VITE_FIREBASE_APP_ID` | Web SDK |
| `VITE_FORM_ENDPOINT` | Adapter `/exec` URL |
| `VITE_BASE` | Marketing base (often `/`) |
| `VITE_APP_BASE` | Apps base (often `/app/`) |

Ship env example files listing these **names** (no secret values). Config reader loads the four Firebase fields + form endpoint.

**Cloud Functions params/secrets**

| Name | Type |
|------|------|
| `FORM_ENDPOINT` | String — same URL as `VITE_FORM_ENDPOINT` |
| `FUNCTIONS_WEBHOOK_SECRET` | Secret |
| `SIGN_IN_URL` | String — password reset continue → `{{CLIENT_ORIGIN}}{{APP_BASE}}signin/` |

**Adapter Script Properties**

| Property | Purpose |
|----------|---------|
| `NOTIFY_EMAIL` | Admin inbox |
| `CALENDAR_ID` | Shared calendar |
| `FUNCTIONS_WEBHOOK_SECRET` | Must match Functions secret |
| `AUDIT_SPREADSHEET_ID` | Optional audit Sheet |

**CI / hosting secrets** — mirror client Firebase + form endpoint into the static-host workflow; reject placeholder values.

**Local Admin SDK only:** service-account path via `GOOGLE_APPLICATION_CREDENTIALS` or CLI `--key` for claim bootstrap / seed. Never commit SA JSON.

### G2. Hardcoded surfaces to replace (not env)

Locate and replace in the hosting tree:

- Callable CORS allowlist → `{{CLIENT_ORIGIN}}`, www, localhost dev ports
- Hardcoded timezone → `{{TZ}}` (backend, client date helpers, adapter)
- Custom domain / CNAME / canonical host → client host
- ICS UID domain, `PRODID`, manage-booking URL, default venue in adapter
- JSON-LD and geo meta — only if local-business intake supplies geo

### G3. Asset swap list

| Asset | What to replace |
|-------|-----------------|
| Logo | Brand mark used in nav/hero |
| Favicons / PWA | ico, 16/32 PNG, apple-touch, 192/512, webmanifest names/colors |
| App card / hub imagery | Member vs staff entry visuals |
| Class / service imagery | Per catalog id |
| OG image(s) | Absolute URLs under `{{CLIENT_ORIGIN}}` — 1200×630 PNG/JPG |

### G4. Email / calendar brand surfaces

Parameterize in the adapter (and any backend-built URLs):

- Enquiry / invite / reminder / guest / reschedule subjects and bodies
- Calendar event title pattern (`{class} · {{BRAND_SHORT}}`)
- Venue default
- Organizer mailto
- Member manage URL → `{{CLIENT_ORIGIN}}{{APP_BASE}}` + member booking route
- ICS `PRODID` and UID domain

Default stack has **no SMS** path unless intake adds one.

---

## H. Metadata and SEO optimisations

White-label SEO is part of the project. **§H is authoritative**—do not block on other SEO markdown files.

### H1. Per-client metadata pack

Author in Client Pack and apply to static HTML / build:

- Unique `<title>`, meta description, `theme-color` matching brand
- Canonical host = `{{CLIENT_ORIGIN}}` (avoid github.io duplicate content)
- Absolute `og:title`, `og:description`, `og:image` (1200×630 PNG/JPG, never relative), `og:url`, `og:type`; matching Twitter `summary_large_image`
- Favicon set (`favicon.ico`, 16/32 PNG, apple-touch-icon, webmanifest 192/512) + names/colors for **this** brand
- JSON-LD: `Organization` (and if local: `LocalBusiness` + `GeoCoordinates` + `Service`) from intake—not leftover template geo
- Optional `/llms.txt` listing this brand’s key URLs (aligned with what `robots.txt` allows)

### H2. Crawling and indexing

- Marketing: indexable; `robots.txt` + `sitemap.xml` for marketing routes only
- Apps under `{{APP_BASE}}`: `noindex,follow` (member/staff apps are not marketing landing pages)
- **AI / GEO (2026):** If AI search visibility matters, do **not** Disallow citation/search bots in `robots.txt` without an explicit intake decision—commonly: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `Google-Extended` (Gemini / AI Mode; distinct from Googlebot), `ClaudeBot`, `PerplexityBot`, `Perplexity-User`, `Applebot-Extended`. `Bytespider` only if targeting those surfaces. Training vs citation is an intake choice (`infra.aiCrawlerPolicy`).
- **CDN/WAF:** Cloudflare (and similar) bot rules can block AI crawlers at the edge even when `robots.txt` allows them—verify dashboard rules and access logs, not only robots.
- Important marketing copy must be in static HTML or prerendered (§M17 when SPA-only)—crawlers often skip client-only JS
- Prefer a hand-written per-brand `/llms.txt` (brand + one-liners + key URLs), not a generic host default

### H3. Local business (when applicable)

- Mirror Google Business Profile naming and categories
- Prefer one clear page per primary service × location when multi-location
- Consistent NAP (name/address/phone) across site, schema, and external profiles

### H4. SEO verification

- [ ] Canonical and OG URLs absolute on `{{CLIENT_ORIGIN}}`
- [ ] Favicon + OG image fetch 200 on production; force re-scrape after changes
- [ ] `robots.txt` references sitemap; demo/app paths Disallow’d or meta-noindex as intended
- [ ] `wl check-seo --root <static-or-seo-dir>` green after publish (or equivalent meta asserts)
- [ ] Rich Results / Sharing Debugger scrape
- [ ] Search Console property for new domain

---

## I. Provisioning and pivot procedure

Execute in order. Tick as you go.

### Phase 0 — Intake and Client Pack

1. Complete Kickoff & planning interview (§L3): stack, surfaces, add-ons, terminology, brand gaps, infra boundary confirmed.
2. Write `engagement-answers.json` from the interview; `wl intake apply-answers --answers … --out client.config.json` (features matrix + draft Client Pack fields).
3. `wl validate --config client.config.json` (or authorize `CLIENT_ASSUMPTIONS.md` for residual gaps) then `wl generate --config client.config.json --out generated/` (theme CSS, brand module, SEO pack, split env **examples**, Script Properties **template**, empty seed skeleton, in-kit brand assets copy, `REBRAND_PROMPT.md` apply aid).
4. `wl lineage stamp --config client.config.json --commit <product-core-sha>` if not already set.
5. `wl intake checklist` (and/or provision dry-run) for human Firebase / Apps Script / Calendar / CI secrets — do not block in-repo build on live infra.
6. Grep / `wl check-brand` against previous brand tokens; list residual replacement targets in the host tree.
7. Use generated `REBRAND_PROMPT.md` only as post-interview apply checklist — never as a substitute for S1–S6.

### Phase 1 — Design re-skin and language

1. Apply tokens + `{{THEME_CLASS}}` to marketing and apps (prefer generated theme CSS).
2. Swap logo/favicons/manifests/class imagery.
3. Replace all UI strings; wire apps chrome to shared brand config (from generate).
4. Update hub / sign-in / staff-console visible labels.

### Phase 2 — Firebase project (**human-gated**)

In-repo build prepares rules, indexes, functions source, and env **names**. Creating the Firebase project, Auth settings, and secret **values** is human work (or `wl provision` when the human has CLI login/billing ready). Prefer `wl provision --config client.config.json --target <host-repo> [--dry-run] [--create-project]`. Manual residuals are printed when billing/console steps cannot be automated.

1. Create project `{{FIREBASE_PROJECT_ID}}`; point Firebase CLI at that project.
2. Enable Email/Password; add authorized domains for `{{CLIENT_ORIGIN}}` (and www if used).
3. Create web app; fill Vite env vars (from generated `env/root.env.example` and `env/apps.env.example`).
4. Deploy: `firebase deploy --only firestore:rules,firestore:indexes,functions` (region `{{FUNCTIONS_REGION}}`) — provision runs this when `host.map.json` maps paths.
5. Set params/secrets:
   - `FORM_ENDPOINT`
   - `FUNCTIONS_WEBHOOK_SECRET`
   - `SIGN_IN_URL` = `{{CLIENT_ORIGIN}}{{APP_BASE}}signin/`
6. Replace `CALLABLE_ORIGINS` with client origins + local dev.
7. Replace `TIME_ZONE` with `{{TZ}}` everywhere it is hardcoded.
8. Bootstrap admin claim (`wl provision --bootstrap-admin` when `GOOGLE_APPLICATION_CREDENTIALS` is set); seed catalog/pricing/slots with **client** data.

### Phase 3 — Google Apps Script + Calendar (**human-gated**)

In-repo build prepares adapter source + Script Properties **template**. Clasp login, Calendar ID, web-app deploy (“Execute as Me / Anyone”), and `/exec` URL wiring are human (or `wl provision` when clasp is ready). Residual manual steps:

1. New Apps Script project under client Google account; deploy parameterized adapter source (brand strings from Client Pack / Script Properties).
2. Set Script Properties from generated `apps-script/script-properties.json` (`NOTIFY_EMAIL`, `CALENDAR_ID`, `FUNCTIONS_WEBHOOK_SECRET`, brand map, optional audit sheet).
3. Create/share calendar; set `CALENDAR_ID`.
4. Deploy Web app: Execute as **Me**, access **Anyone**.
5. Copy `/exec` URL → `VITE_FORM_ENDPOINT` and `FORM_ENDPOINT`.
6. Smoke-test public `enquiry` and one signed webhook action (invite or calendar upsert) with matching `FUNCTIONS_WEBHOOK_SECRET`.

### Phase 4 — DNS, hosting, CI

Provision prints the DNS residual checklist; humans own registrars.

1. Set `CNAME` / DNS to hosting target; wait for SSL.
2. Update GitHub Pages (or host) secrets; ensure workflow rejects placeholder Firebase values; enable §M22 / `wl check-brand` + `wl check-seo` in CI when possible.
3. Confirm `{{CLIENT_ORIGIN}}` serves marketing and `{{CLIENT_ORIGIN}}{{APP_BASE}}` serves apps.
4. CORS: call a callable from the browser on the new origin.

### Phase 5 — CMS content and legal

1. Fill `siteContent/current` (hero, schedule narrative, contact display, payment instructions, terms, waiver).
2. Confirm staff console legal/payments / site-content editors update the live CMS docs.

### Phase 6 — SEO publish

1. Apply §H metadata pack — prefer generated SEO pack from `wl generate` (`seo/robots.txt`, `sitemap.xml`, meta fragments, JSON-LD).
2. Publish `robots.txt`, `sitemap.xml`, optional `llms.txt`.
3. `wl check-seo --root <static-or-seo-dir>`; submit Search Console; run scrapers.

### Phase 7 — Cutover hygiene

Run `wl cutover --config client.config.json --root <host> [--previous previous-brand.tokens.json] [--previous-project <oldId>]`.

1. Rotate webhook secrets if migrating from a prior deployment (cutover prints a candidate secret + set commands).
2. Invalidate old Auth continue URLs / authorized domains no longer used.
3. Remove old SA keys from disks; never commit them (cutover scans and warns).
4. Final brand-grep + SEO check (§J) via the same command.

---

## J. Edge cases, friction, and acceptance

### J1. Invisible friction checklist

- [ ] Default TZ/locale/currency formatting consistent in Functions, client date labels, Apps Script, seeds
- [ ] Operating hours and season/holiday calendar match client reality
- [ ] Transfer window / settings (`meta/settings`) reviewed—not left at template assumptions blindly
- [ ] Mobile: week-cal badges, field popovers, role-call overlay, working overlay at common breakpoints
- [ ] Touch targets on slot selection usable on phone
- [ ] Password reset lands on client `SIGN_IN_URL` with domain authorized
- [ ] CI rejects empty/`-` Firebase secrets
- [ ] Apps Script redeploy after code edits (URL/version discipline)

### J2. End-to-end verification matrix

| Case | Expect |
|------|--------|
| Admin sign-in | Staff console; all admin tabs; can create member, set role, generate season |
| Trainer sign-in | Staff console; elevated tabs only; can mark attendance / manage sessions as staff |
| Member pending | Cannot book until approved/activated per product rules |
| Member active book | Roster write; ICS email; capacity enforced |
| Member weekly lock/unlock | Series invite/cancel; suppressed per-session invites |
| Drop-in confirm | Priced acknowledge path works |
| Staff move session | Shared calendar upsert; `calendarEventId` updated |
| Cancel/delete session | Calendar delete + member communications as designed |
| Contact form | Enquiry to `{{NOTIFY_EMAIL}}` only (no open relay) |
| Broadcast | Admin send arrives branded |
| CORS | Callables succeed from `{{CLIENT_ORIGIN}}` |
| Calendar subscribe URL | Callable returns client calendar links |
| Brand grep | No previous brand/domain/phone/email in user-facing surfaces |
| SEO smoke | Canonical, OG, favicon, robots/sitemap OK |

**Automation:** `wl e2e` runs the smoke subset (brand grep, SEO pack, form/CORS shape). `wl e2e --full` (Playwright, `E2E_FULL=1` + seeded users) covers sign-in/booking rows against a live deployment. Passing toolkit E2E satisfies the corresponding matrix rows.

### J3. Brand leakage grep (adapt tokens to the *source* template being left behind)

Search the client tree for previous project identifiers (names, short codes, old domains, old emails, old phones, old theme class). Fix every user-facing and config hit. Allow hits only inside this prompt’s appendix or historical docs explicitly marked obsolete.

**Automation:** `wl check-brand --root <host> --previous previous-brand.tokens.json` (or `previousBrand` on the client config). CI must fail on hits outside the allowlist (§M22).

---

## K. Acceleration work (perform when executing a pivot)

When the project requires code edits, prefer these consolidations so the **next** white-label is faster. Items 1–5 and 7–10 are implemented by `@whitelabel/pivot-kit` (`wl`) when that toolkit is present:

1. **Single Client Pack module** shared by marketing and apps (name, shortName, contacts, origin, social, hashtag, assets, empty catalog slot) — `wl generate` → `client-pack/brand.ts`.
2. **Theme class per client**; shared widget CSS token-only — `wl generate` → `theme/{{THEME_CLASS}}.css` (`--wl-primary` / `--wl-secondary` hooks).
3. **Configurable timezone, locale, currency formatter**, CORS origins, and sign-in continue URL from env/params—not scattered literals — generated `env/root.env.example`, `env/apps.env.example`, `env/functions.params.example.env`.
4. **Adapter brand map** via Script Properties (brand short, origin, venue default, manage URL, PRODID/UID domain) — `apps-script/script-properties.json`.
5. **SEO pack** generated from Client Pack into static HTML / build so meta cannot drift from brand config — `seo/*` + `wl check-seo`.
6. Keep Product Core APIs stable; put experimentation in Client Pack and presentation. Never ship themed vertical catalogs in toolkit defaults.
7. **Template lineage** (`templateLineage.upstreamCommit`) so core fixes can be back-ported without a blind full brand re-audit — `wl lineage stamp` (§D3).
8. **Brand-leak CI** — `wl check-brand` in every pivot CI (§J3 / §M22). Optional scrub example: `examples/previous-brand.example-prior.json`.
9. **Cutover hygiene script** — `wl cutover` for secret rotation reminders, Auth domain flags, SA key scan, final gates (Phase 7).
10. **E2E suite** parameterized by client config — `wl e2e` / `wl e2e --full` (§J2).
11. **In-kit brand placeholders** — `templates/brand/*` copied into `generated/brand-assets/`; toolkit remains self-contained.
12. **Post-interview REBRAND apply aid** — `generated/REBRAND_PROMPT.md` subordinate to §L3.

Do not block launch on a perfect abstraction—but do not add new hardcoded brand strings while you work.

---

## M. Reusable interactive, assessment, ops & UX patterns

Optional Product Core contracts. Client Pack owns labels, cohort names, venue names/coords, and narrative only. Do **not** paste vertical content packs (breed banks, posture catalogs, facility catalogs, pedagogy corpora) into unrelated clients.

Each subsection is complete: **When**, **Invariants**, **Build** (what to implement in-repo), **Acceptance**. No external docs required.

### M0. When §M is in scope

Apply matching subsections if the product needs any of: fixed-sum allocation; engine-in-SPA hosting; headless scoring; drag autosave; scroll-vs-range mobile UX; cross-instrument calibration; soft must-have gates; swappable content packs; unlock + synthesis; preference overlay without weight drift; normative/capability bands; multi-site commute slots; SPA↔adapter field lineage; public form abuse controls; assessment→lead handoff; SSG prerender; offline staff mutations; shared form/UX primitives; capped blends; showcase mode; CI brand/SEO gates; terminology maps; or Calendar/Sheet public stack without studio Firestore roster math.

Skip §M entirely for a pure §§A–L booking pivot that needs none of the above.

### M12. Pattern application checklist (agent)

1. List needed M1–M11 and M13–M24; skip the rest.
2. Implement Product Core modules first; re-skin second.
3. Keep Client Pack out of redistribution math, caps, weight tables, commute engines, and field-lineage **keys**.
4. Implement allocation from **§M1.1–M1.10** (algorithms in this file)—do not defer to another guide or repo.
5. Add headless tests for scoring, allocation, commute, or blend math you add.
6. Do not import vertical content packs into unrelated clients.
7. Do not rewrite §§A–L studio booking invariants for commute/Calendar/Sheet stacks unless the human chooses §M24 (or documents an exception).
8. Portfolio demos → §M21 (flag-gated); never commit live client secrets for demos.
9. Static marketing “done” requires §M22-style CI gates (or equivalent) plus §H/§J3.
10. Prefer §M23 terminology maps over scattered vertical nouns.
11. On transfer: keep contracts self-contained; discover host paths; leave no sibling-doc or assumed-filename dependencies.

---

### M1. Fixed-sum allocation redistributor

**When:** N interdependent weights must always sum to a fixed target (typically 100%).

**Invariants:**

- Store weights as **integer tenths** of a percent (`P = 10`, target `T = 1000` for 100.0%). Display 0–100 with step `0.1`.
- On every **committed** change: pin the edited member; redistribute residual across peers. Never treat sliders as independent then normalize only on submit.
- Do not call export-normalize on every drag frame; use it only for canonical snapshots if needed.
- Zeros stay zero unless bootstrap (all peers zero) even-splits residual.
- After proportional take/give, apply the **stagnation guard** below.
- One shared math module for React and any DOM UI.
- **Drag-deferred peer commit:** mid-drag update only the active thumb; redistribute on `pointerUp` (keyboard/`change` immediate). Use `setPointerCapture`. `role="group"` + `aria-valuetext` (e.g. “N percent”).
- **Dimensions:** slice flat `values[]` into groups; each group independently sums to `T`.
- **Modes:** same storage for `allocate` (blend shares) and `exclusive` (one-hot with `T` on the selected member).
- With §M5: prefer deferred commit for linked groups; add scroll-priority guard for independent ranges that still steal scroll.

**Build:** Pure module implementing the algorithms below; linked-slider UI wired to it; headless tests for sum=`T`, zeros, dimensions, exclusive, stagnation.

#### M1.1 Symbols and display conversion

| Symbol | Typical | Meaning |
|--------|---------|---------|
| `P` | `10` | Internal units per 1.0% |
| `T` | `100 × P` = `1000` | Target sum at 100% |
| `w_j` | `0 … T` | Stored weight for member `j` |

```text
parse(displayPercent)  = clamp(round(displayPercent × P), 0, T)
format(w_j)            = round((w_j / T) × 100 × 10) / 10     // one decimal for labels
```

Legacy upgrade: if `Σ w_j ≤ 100` and `max(w_j) ≤ 100`, treat as old integer-percent storage and set `w_j ← w_j × P`.

Valid committed state: `Σ_j w_j = T` (per dimension group when dimensions apply).

#### M1.2 `createEmptyWeights(ids, T)`

Same as `splitEvenly(ids, T)` (M1.3). Initial linked-slider answers start even across members.

#### M1.3 `splitEvenly(ids, B)` — floor + lex remainder

Used for bootstrap and when proportional pool sum is 0.

```text
n = |ids|
if n = 0 or B ≤ 0 → all assigned 0 (preserve any prior map keys if provided)

base = ⌊B / n⌋
remainder = B - base × n
∀ id ∈ ids: assign[id] = (prior[id] || 0) + base
Sort ids lexicographically; for i in 0..remainder-1:
  assign[sorted[i]] += 1
Property: Σ assign increments over ids = B exactly.
```

#### M1.4 `splitProportionalDeltaSpread(ids, prior, B)` — Phase A + D’Hondt

Splits integer budget `B > 0` across `ids` in proportion to `prior`.

```text
S = Σ_{j ∈ ids} max(0, prior[j])
if S ≤ 0 → return splitEvenly(ids, B)

out[j] = 0 for all j
remaining = B
n = |ids|

Phase A — minimum participation when affordable:
  if remaining ≥ n:
    Sort ids by (prior ascending, then id ascending)
    For each id in that order:
      out[id] += 1; remaining -= 1
    // Smallest priors get their +1 first so large axes do not absorb the whole minimum pass.

Phase B — D’Hondt sequential assignment (repeat `remaining` times):
  Pick id maximizing score(j) = prior[j] / (out[j] + 1)
  Tie-break: lexicographically smallest id
  out[winner] += 1

Property: Σ out = B exactly.
Continuous ideal (intuition only): ideal_j = B × prior[j] / S
```

#### M1.5 `applyStagnationGuard(out, prior, activeOthers, Δ)`

After proportional take/give, floor effects can leave some active peers unchanged. Move single units so stuck peers participate **without changing `Σ out`**.

```text
Activate only if |Δ| ≥ max(2, |activeOthers|)

Stuck = { j ∈ activeOthers : out[j] = prior[j] }

While Stuck nonempty (cap ~ |activeOthers|×|Δ| + 8):
  maxMover = argmax_j |out[j] - prior[j]| over activeOthers
  if maxChange < 1: stop
  recipient = stuck member with largest prior[j] (tie: smallest id)
  if maxMover = recipient: stop

  Transfer 1 unit (sum preserved) so stuck moves in the same direction as the pool:
    // Δ > 0: peers were decreased — pull 1 more from a stuck peer onto the largest mover
    if Δ > 0:
      out[maxMover] += 1
      out[recipient] = max(0, out[recipient] - 1)
    // Δ < 0: peers were increased — take 1 from the largest mover onto a stuck peer
    if Δ < 0:
      out[maxMover] = max(0, out[maxMover] - 1)
      out[recipient] += 1
  Recompute Stuck
```

Note: `|Δ| = 1` (one 0.1% step) can move at most one peer by one unit—expected. Multi-step drags (`|Δ| ≥ 10` for 1.0%) hit Phase A + guard.

#### M1.6 `redistributeOnChange(changedId, newValue, weights, T, allIds)`

`allIds` is required so zero-weight members stay in the model. `newValue` may be internal integer units or a display float (non-integer → `parse`).

```text
∀ id ∈ allIds: prior[id] = max(0, round(weights[id] || 0))
clamped = clamp(round(parsed newValue), 0, T)
others = allIds \ { changedId }
Δ = clamped - prior[changedId]
out = copy(prior); out[changedId] = clamped

Degenerate:
  if T - clamped ≤ 0:
    ∀ j ∈ others: out[j] = 0; return out
  activeOthers = { j ∈ others : prior[j] > 0 }
  zeroOthers   = { j ∈ others : prior[j] = 0 }
  if activeOthers empty:
    if Δ > 0: out ← splitEvenly(zeroOthers, T - clamped) on others; return
    else:     ∀ j ∈ zeroOthers: out[j] = 0; return
  if Δ = 0:
    ∀ j ∈ zeroOthers: out[j] = 0; return

Main path:
  spread = splitProportionalDeltaSpread(activeOthers, prior, |Δ|)
  if Δ > 0:  ∀ j ∈ activeOthers: out[j] = max(0, prior[j] - spread[j])
  if Δ < 0:  ∀ j ∈ activeOthers: out[j] = prior[j] + spread[j]
  ∀ j ∈ zeroOthers: out[j] = 0
  applyStagnationGuard(out, prior, activeOthers, Δ)
  return out
```

Zeros are **never** in the proportional pool except the all-zero bootstrap path.

#### M1.7 Optional `normalizeAllocation(weights, T)` (export only)

Scale proportionally to sum `T`, then fix integer drift by ±1 on sorted ids until `Σ = T`. **Do not** call this on live drag—live coupling must use raw `redistributeOnChange` output.

#### M1.8 Answer shape, modes, dimensions, UI wiring

```text
answer = {
  ids: string[],
  weights: Record<id, integer>,   // sum = T (or per-dimension groups each sum to T)
  sum: T,
  version: "1.0"
}
isValid ⇔ sumWeights(weights) === T   // per group when dimensioned
```

**Exclusive mode:** selecting member `k` sets `w_k = T` and all other group members to `0` (one-hot). Same storage as allocate mode.

**Dimensions:** partition `ids` into groups `G1…Gk`; run create/redistribute/validate independently per group with the same `T`. Flat UI arrays are fine: slice contiguous pole ranges per dimension, redistribute inside the slice, write back.

**Array ↔ record bridge (typical React wiring):**

```text
values: number[]                     // parallel to poles[]
ids = poles.map((_, i) => String(i)) // or stable pole.id keys
prior = { ids[i] → values[i] }
next = redistributeOnChange(ids[index], parse(displayPercent), prior, T, ids)
values' = ids.map(id → next[id])
```

**UI (must call the same math):**

```text
pointerdown → setPointerCapture; enter drag state for that index
input while dragging → update only active member display; do NOT redistribute peers yet
pointerup → commit(displayPercent) → redistributeOnChange → onChange(values')
keyboard / non-pointer change → commit immediately (no drag deferral)
pointercancel → abandon drag; leave committed weights unchanged

Starved-zero disable:
  if some other member already has w = T and this member has w = 0 → disable this input
  (cannot take from a zero while another holds 100%; user must first lower the full member)

aria-valuetext reflects format(w_j) (e.g. “42.3 percent”)
role="group" on the linked set
```

#### M1.9 What this is *not*

| Approach | Used? |
|----------|-------|
| Rebuild others as `remainder × prior/S` in one shot | **No** — use delta take/give |
| Even-split all others whenever any axis is 0 | **No** — zeros excluded; bootstrap only |
| Independent sliders normalized only on submit | **No** — couple on commit |
| Floating weights in live state | **No** — integers only; display rounds |

#### M1.10 Worked examples (`T = 1000`)

**A — Increase lead by 1.0% (`Δ = +10`)**  
Prior `{A:700, B:200, C:70, D:30}` → raise A to `710`.  
`activeOthers={B,C,D}`, budget `10`. Phase A gives each 1; D’Hondt assigns remaining 7 favoring larger priors. All three others drop.

**B — Zero excluded**  
Prior `{A:500, B:500, C:0}` → lower A to `400`. Give `100` only to B → `{400, 600, 0}`.

**C — Bootstrap**  
Prior `{A:500, B:0, C:0}` → raise A to `700`. Others were all zero → `splitEvenly({B,C}, 300)` → `{700, 150, 150}`.

**Acceptance:**

- [ ] Internal weights sum to `T` after every commit (per group/dimension).
- [ ] Peer rebalance on drag-commit; zeros excluded except bootstrap.
- [ ] Mid-drag does not thrash peers.
- [ ] Exclusive mode stores one-hot shares; dimensions each sum to `T`.
- [ ] Large moves (`|Δ| ≥ max(2, n_active)`) visibly affect stuck peers (stagnation guard).
- [ ] No floats in live weight state; rounding only for display.
- [ ] Headless tests cover: createEmpty sum, conserve sum, 1.0% spread across others, zeros, bootstrap.

---

### M2. Engine host contract

**When:** Durable assessment/orchestration engines must run inside a SPA without rewriting all logic into React.

**Invariants:**

- Engine owns phases, question sequence, scoring, progress I/O.
- Host sets external-UI mode, phase notify hooks, and one of: React questions from snapshots; DOM bridge mount; full DOM shell for engine-owned bodies.
- Unmount tears down listeners, bridges, timers, and save flushers—no orphans.

**Build:** Host hook/API + engine view + optional HTML results bridge; prove same engine under legacy HTML and SPA.

**Acceptance:**

- [ ] Same engine class under legacy and SPA host.
- [ ] Phase changes sync chrome without double-mount.
- [ ] Unmount cleans host API, bridges, save flushers.

---

### M3. Scoring-core extraction

**When:** Numeric models must survive UI rewrites and support headless regression.

**Invariants:**

- Pure ESM (or equivalent) kernels hold math + versioned config; engines do I/O only.
- Bump an explicit version constant when behavior changes.
- Proof layers: UI/E2E smoke + Node/headless scoring tests.

**Build:** Versioned scoring package importable without DOM; at least one headless proof; persist model version on stored results when behavior matters.

**Acceptance:**

- [ ] Scoring importable from Node without DOM.
- [ ] Version on stored results when model behavior matters.
- [ ] Headless proof covers the kernel.

---

### M4. Drag-safe autosave

**When:** Continuous controls write progress often.

**Invariants:**

- Trailing debounce while dragging (~400ms typical).
- Synchronous flush on navigation and `beforeunload`.
- Cleanup removes timer and unload listener.

**Build — algorithm:**

```text
state: timer = null

flush():
  clear timer if set
  call engine.saveProgress() (or configured method)

schedule():
  clear timer if set
  timer = setTimeout(flush, delayMs)   // default 400

attach(engine):
  engine.scheduleSaveProgress = schedule
  engine.flushSaveProgress = flush
  window.addEventListener("beforeunload", flush)

detach(engine):
  clear timer; remove beforeunload; delete helpers

Wiring:
  on continuous input (slider drag) → schedule()
  on Next / route leave / unmount → flush() then detach
```

**Acceptance:**

- [ ] Mid-drag does not spam storage every `input`.
- [ ] Leave/advance persists latest weights/answers.
- [ ] Unmount does not leave dangling timers/listeners.

---

### M5. Scroll-priority range guard

**When:** `<input type="range">` sits on vertically scrollable mobile pages.

**Invariants:**

- If touch movement is mostly vertical, revert the range so page scroll wins.
- Attach once per input; do not block intentional horizontal scrub.
- Complementary to §M1 deferred commit.

**Build — algorithm:**

```text
attach once (guard flag on element):
  on touchstart: record startX, startY, startValue; suppress = false
  on touchmove:
    dx = |x - startX|; dy = |y - startY|
    if dy > dx + 10:          // vertical-dominant slack
      suppress = true
      range.value = startValue
  on input:
    if suppress: range.value = startValue
```

Use `{ passive: true }` on touch listeners. For §M1 linked groups, prefer deferred peer commit; use this guard on independent ranges that still fight scroll.

**Acceptance:**

- [ ] Vertical scroll does not silently change nearby sliders.
- [ ] Horizontal scrub still updates the control.

---

### M6. Bounded cross-instrument calibration

**When:** Later instruments may nudge earlier scores for suite coherence.

**Invariants:**

- Primary instrument stays primary; secondary deltas hard-capped (per-cluster and overall).
- One versioned calibration config module.
- Persist calibration version + input fingerprint/hash when applied.

**Build:** Config + apply function with caps; audit fields on stored results.

**Acceptance:**

- [ ] Caps enforced in code.
- [ ] Behavior change bumps version.
- [ ] Stored results record delta + fingerprint when calibration ran.

---

### M7. Soft prerequisite gates

**When:** Category ranking needs “must-have” evidence without hard exclude.

**Invariants:**

- Missing signals → continuous pass-rate → penalty multiplier (not silent eliminate unless product hard-fails).
- Gate types/curves versioned; diagnostics on analysis output.

**Build:** Gate evaluator + diagnostics attachment.

**Acceptance:**

- [ ] Weak must-haves dampen rather than drop (unless hard-fail mode).
- [ ] Diagnostics show which gates failed and the multiplier.

---

### M8. Content pack vs orchestrator

**When:** Client-specific banks/catalogs must swap without forking engines.

**Invariants:**

- Content packs are data modules with barrel exports; engines import them.
- Packs must not own orchestration, auth, or Firebase.
- Large packs may lazy-load via a cached dynamic importer.

**Build:** Pack directory convention + loader; engines depend on pack API only.

**Acceptance:**

- [ ] Replacing a pack changes items/copy without editing scoring kernels.
- [ ] Pure scoring cores need no brand strings.

---

### M9. Prerequisite gate registry + synthesis map

**When:** Multi-module products unlock surfaces after completions, then compose a report.

**Invariants:**

- One shared completion/progress reader is SoT for unlock and coherence rules.
- Nav gates apply to chrome—not an excuse for body-copy leakage.
- Synthesis **reads snapshots**; it does not re-score. Excerpt builders dedupe/clip.

**Build:** Completion reader, nav-gate helper, pure synthesis/excerpt functions.

**Acceptance:**

- [ ] Unlock predicates single-sourced.
- [ ] Synthesis blocked until prerequisites pass.
- [ ] Report builders are pure over stored snapshots.

---

### M10. Fixed weights + preference overlay

**When:** Preference/tension UX must inform narrative without corrupting the numeric model.

**Invariants:**

- Core cluster/axis weights stay fixed; preferences do not renormalize them.
- Preference module ranks conflict/cost lines for UX and copy only.
- Document the separation in code comments near both modules.

**Build:** Fixed weight tables + preference ranker with no write-back into primary vectors.

**Acceptance:**

- [ ] Toggling preference UI does not change published core weights.
- [ ] Tension ranking available for narrative without mutating primary scores.

---

### M11. Normative spectrum + capability band

**When:** Results need more than a single point marker.

**Invariants:**

- **Spectrum:** continuous track (0–1 or 0–100) with user position, band labels, optional cohort markers; UI and export share helpers.
- **Capability band:** min–max interval from a scalar, rendered as range fill—not only a point.
- Cohort/band **labels** from Client Pack; geometry/math in Product Core.

**Build:** Shared meta helpers for position, bands, markers; reuse in export/print.

**Acceptance:**

- [ ] Markers/fills from shared meta—not duplicated magic numbers in CSS/JSX.
- [ ] Export/print reuse the same descriptions as on-screen UI.

---

### M13. Commute-aware multi-site availability (optional booking add-on)

**When:** Mobile/multi-venue operator; free/busy alone would double-book travel.

**Invariants:**

- Slot engine considers haversine commute between venues, rounded up to the slot grid, plus minimum transition/handover floor.
- Busy overlap + handover still apply; commute is additive.
- Optional dual duration (billed/session minutes vs longer calendar block).
- Optional all-day calendar sentinels open secondary regions / pop-up days.
- Venues, coords, region flags, prices in Client Pack/config—not in engine brand strings.
- Does **not** replace §§A–L studio roster/capacity math unless scope says so.

**Build — algorithms:**

```text
Config (Client Pack / shared constants — brand-free numbers):
  SLOT_INTERVAL_MINUTES   // e.g. 15
  TRANSITION_MINUTES      // e.g. 5  (same-venue handover floor)
  COMMUTE_SPEED_KMH       // e.g. 48 road-speed model
  HOME_VISIT_COMMUTE_MINUTES  // e.g. 30 floor when either end is "home/unknown"
  venues[] = { id, name, lat, lng, regionId, homeVisit? }

haversineKm(lat1,lng1,lat2,lng2):
  R = 6371
  dLat, dLng in radians
  a = sin²(dLat/2) + cos(lat1)·cos(lat2)·sin²(dLng/2)
  return R · 2 · atan2(√a, √(1−a))

commuteMinutes(fromId, toId):
  if fromId = toId or either missing → 0 (or TRANSITION if unknown venue)
  if either is homeVisit/unknown → max(TRANSITION, HOME_VISIT_COMMUTE_MINUTES)
  km = haversineKm(...)
  raw = (km / COMMUTE_SPEED_KMH) · 60
  return max(TRANSITION, ceil(raw / SLOT_INTERVAL) · SLOT_INTERVAL)

gapBetween(fromId, toId):
  if same venue → TRANSITION_MINUTES
  else → commuteMinutes(fromId, toId)

fitsCommuteForLocation(slotStart, slotEnd, locationId, daySessions[]):
  // daySessions = already-booked blocks that day with resolved venue ids
  prev = latest session with end ≤ slotStart
  next = earliest session with start ≥ slotEnd
  if prev and slotStart < prev.end + gap(prev.loc, locationId): reject
  if next and next.start < slotEnd + gap(locationId, next.loc): reject
  accept

getAvailableSlots(date, regionId, locationId, bookingType):
  durations = { sessionMinutes, calendarBlockMinutes }  // dual duration when needed
  windows = daylight/operating windows for date+region
  events = busy calendar events for date (+ region filter)
  daySessions = booked sessions with venues for date
  for each window, cursor from windowStart stepping SLOT_INTERVAL:
    slotStart = cursor
    calendarEnd = slotStart + calendarBlockMinutes
    accept if:
      ≥ earliest bookable time
      calendarEnd fits window
      !overlapsBusy(slotStart, calendarEnd, events, buffer=TRANSITION)
      !overlaps daySessions
      fitsCommuteForLocation(...)
      // optional: secondary region requires all-day sentinel event (title pattern) that day

Calendar sentinel (optional secondary region):
  isServiceDay(date, region) ⇔ exists all-day event whose title matches configured pattern
  Only those sentinel-titled events (not the whole calendar) block that region’s slots
```

**Acceptance:**

- [ ] Different-venue consecutives leave commute + transition time.
- [ ] Grid rounding and handover enforced in code.
- [ ] Secondary-region gating is config-driven when used.
- [ ] Client Pack can swap venues/coords without editing RBAC/roster cores.

---

### M14. Dual-maintained SPA ↔ adapter field contracts

**When:** Public SPA posts to Apps Script / Sheets / CRM and column drift would break ops.

**Invariants:**

- One field-lineage map: form UI → API payload → Sheet/CRM columns → staff import targets.
- Shared modules for pricing/packages/service types/datetime that adapter also encodes—keep-in-sync comments or generated stubs.
- Every stored public field has a lineage row.

**Build — lineage schema:**

```text
BookingFieldLink = {
  label: string                 // UI label
  source: "react-state" | "form-input" | "computed" | "extended-json"
  formKey?: string              // React state / input name
  apiKey?: string               // top-level POST JSON key
  sheetColumn?: string          // e.g. "C"
  sheetHeader?: string          // e.g. "Name"
  extendedJsonPath?: string     // path inside an overflow JSON column when used
  importTarget?: string         // staff CRM field path
  required?: boolean
}

SheetColumns = ordered [{ col, header, key }, ...]   // must match adapter append row

Maintain in one module:
  FIELD_LINKS: BookingFieldLink[]
  SHEET_COLUMNS: SheetColumns

Adapter doPost / appendSubmissionRow MUST read the same keys/order.
Pricing/packages/datetime helpers duplicated in adapter carry "keep in sync with <module>" headers
  (or generate adapter constants from the TS module in CI).

Pivot checklist: every user-facing stored booking field → exactly one lineage row.
```

**Acceptance:**

- [ ] New form field updates map + adapter in the same change set.
- [ ] Sheet/CRM headers and API keys match the map.
- [ ] Pivot fails if a stored booking/enquiry field has no lineage row.

---

### M15. Public booking abuse stack

**When:** Unauthenticated public `doPost`/form endpoints accept bookings or enquiries.

**Invariants:**

- At least: honeypot, server-side rate limit / lock (e.g. cache + script lock), preferably bot challenge (e.g. Turnstile)—not client-only.
- Prefer `text/plain` bodies for Apps Script (custom headers unreliable).
- Secrets/site keys in env / Script Properties—never committed.
- Public actions must not be open mail relays (fixed notify inbox).

**Build — request pipeline:**

```text
Client POST:
  Content-Type: text/plain;charset=utf-8
  body = JSON.stringify(payload)     // Apps Script reads e.postData.contents

Payload always includes:
  action: "book" | "enquiry" | "lookup" | "availability" | …
  website: ""                        // honeypot — bots fill this; humans leave empty
  turnstile_token?: string           // when challenge enabled

Adapter entry (order matters):
  1. Parse JSON from text/plain body
  2. if trim(payload.website) ≠ "" → soft-fail (200 ok / no-op or generic error; do not process)
  3. assertRateLimit(bucket, max, windowSec) using script cache:
       key = "rl:" + bucket
       count = Number(cache.get(key) || 0)
       if count ≥ max → reject "too many requests"
       cache.put(key, count+1, min(windowSec, 21600))
     Buckets (tune per action):
       per-contact: action + ":" + (normalizedEmail || normalizedPhone || "anon")
       global: action + ":global"
  4. if TURNSTILE_SECRET set:
       POST token to siteverify; require success; else reject
  5. Dispatch action; emails only to configured NOTIFY_EMAIL (never attacker-controlled dest)

Signed internal actions (Functions → adapter) still require webhookSecret match — separate from public abuse stack.
```

**Acceptance:**

- [ ] Empty honeypot (+ valid challenge when in scope) required for success.
- [ ] Repeated posts throttled.
- [ ] Endpoint is not an open relay.

---

### M16. Assessment → lead handoff

**When:** A tool should prefill contact/booking without re-entry.

**Invariants:**

- Versioned handoff payload (e.g. `sessionStorage`) at completion; consumer via explicit query/route flag.
- Shape is Product Core (ids, scores, summary keys)—not vertical catalogs or brand copy.
- Clear/expire after successful consume.

**Build — handoff contract:**

```text
HANDOFF_KEY = "<product>_tool_handoff"     // Client Pack may prefix; shape is Product Core
TTL_MS = 60 * 60 * 1000                    // typical 1h

Handoff = {
  version: "1",
  message: string,           // prebuilt enquiry/booking note
  summaryIds: string[],      // selected outcome/option ids
  contextId?: string,
  impact?: string | number,
  shares?: Record<string, number> | number[],   // optional allocation snapshot
  createdAt: number          // epoch ms
}

saveHandoff(h):
  sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(h))

loadHandoff():
  raw = sessionStorage.getItem(HANDOFF_KEY)
  if !raw → null
  parse; if missing required fields → clear + null
  if now - createdAt > TTL_MS → clear + null
  return h

clearHandoff(): sessionStorage.removeItem(HANDOFF_KEY)

Producer: on tool complete → saveHandoff(...); navigate to /contact?from=tool (or /book?…)
Consumer: on mount if query flag present → loadHandoff → prefill message/fields → clearHandoff on successful submit
```

**Acceptance:**

- [ ] Complete tool → lead form prefills agreed fields.
- [ ] Missing/expired handoff → empty form, no crash.
- [ ] No vertical content packs required for the API.

---

### M17. SSG prerender handshake for SPA marketing

**When:** Marketing is a client-rendered SPA on static hosting but crawlers need real HTML.

**Invariants:**

- Post-build headless crawl waits for explicit ready signal (e.g. `html[data-seo-ready="true"]`) **and** root content.
- One route registry feeds prerender, sitemap, and CI asserts.
- Volatile routes (live slots) excluded or shell-only.
- Static-host deep links: copy the SPA shell HTML into routed path dirs and/or ship a host-level SPA fallback (commonly root `404.html` on GitHub Pages).
- Complements §H.

**Build — handshake + crawl:**

```text
Route registry (single source):
  SEO_ROUTES = [{ path, … }, ...]
  sitemap.xml and CI assert the same list
  VOLATILE = { "/book", … }   // live availability — still may prerender shell, never stale slot HTML as truth

App Seo effect (per route):
  apply title, description, canonical, OG, Twitter, JSON-LD, favicons
  then: document.documentElement.dataset.seoReady = "true"
  cleanup on unmount: delete dataset.seoReady

Prerender script (post vite build):
  start preview server on build output
  launch headless browser
  for each path in SEO_ROUTES:
    goto(url, waitUntil = path in VOLATILE ? "domcontentloaded" : "networkidle")
    wait for html[data-seo-ready="true"]   // timeout → fail build
    wait for #root > *                      // timeout → fail build
    write page.content() → outDir + routeToFile(path)
      "/" → index.html
      "/x" → x/index.html
  close browser + preview

CI: fail if ready handshake times out or required meta missing (§M22 / §H).
```

**Acceptance:**

- [ ] Prerendered HTML has per-route title/description and primary content without crawler JS.
- [ ] Ready timeout fails the build (no empty shells).
- [ ] Sitemap ⊆ prerender registry (minus deliberate exclusions).
- [ ] Deep links return the app shell on static hosting.

---

### M18. Offline-first staff mutations

**When:** Staff work on unreliable mobile networks.

**Invariants:**

- Local cache (e.g. IndexedDB) + write queue + optimistic UI; visible sync status.
- One mutation helper writes live or enqueues—no scattered ad-hoc storage writes.
- Optional tenancy paths (`tenants/{id}/…`, `userMemberships/{uid}/{tenantId}`) do not overturn default one-Firebase-per-client (§A) unless scope changes.
- UI nouns from §M23 terminology—not hardcoded vertical labels in mutation paths.

**Build — mutation + queue:**

```text
tenantPath(tenantId, collection, id?) =
  id != null ? `tenants/${tenantId}/${collection}/${id}`
             : `tenants/${tenantId}/${collection}`

PendingChange = { id, timestamp, type, path, data, method: "set"|"update"|"remove" }

mutate(path, data, type, method = "set"):
  applyOptimisticCacheUpdate(path, data, method)   // IndexedDB / local mirror
  notify UI listeners
  if online && dbConnected:
    try firebaseWrite(path, data, method); status = synced
    catch → enqueue(change); status = offline ("saved locally")
  else:
    enqueue(change); status = offline

SyncManager:
  persist pendingChanges to localStorage/IDB
  on window "online" / db reconnect → processPendingChanges FIFO
  expose status ∈ { synced, syncing, offline, error } + pendingCount
  UI banner: retry / discard pending

Do not write feature data outside mutate() / sync flush.
```

**Acceptance:**

- [ ] Offline create/update survives reload and flushes later.
- [ ] Pending/failed queue visible and retryable.
- [ ] Terminology map can relabel staff UI without editing mutation paths.

---

### M19. Form / UX primitive kit (thin)

**When:** Shared interaction contracts without a second design system.

**Invariants:**

- Dual-mode assessment shell: shared chrome (progress, Back/Restart/Continue) hosts cards or sliders.
- Step visual state: `active` | `done` | `upcoming` from one state machine; `aria-current="step"`.
- Combobox: `combobox` + `listbox`/`option`, arrows, Enter, Escape, `aria-activedescendant`, outside-click close.
- Hover-only UI gated with `(hover: hover) and (pointer: fine)`; touch gets tap equivalents.
- Honor `prefers-reduced-motion`.
- Modal/sheet: Escape, focus to close, restore focus, body scroll lock, `aria-modal`.
- Compact disclosure: hover/focus on fine pointer; click-to-expand on touch.

**Build — contracts (implement only what the pivot needs):**

```text
// Progressive steps — single source for nav + panels
flags = { step1Done, step2Done, … }   // derived from form completeness
visualState(stepIndex, flags):
  if prior step incomplete → "upcoming"
  else if this step’s done flag → "done"      // last step may stay "active" when done=ready-to-submit
  else → "active"
nav/panel class = "is-" + visualState(...)
aria-current="step" only when visualState === "active"

// Dual-mode shell
QuizShell(mode: "options" | "sliders", progress, onBack, onRestart, onContinue)
  hosts OptionCards (aria-pressed) OR linked-slider children (§M1)

// Combobox
role=combobox, aria-expanded, aria-controls=listboxId, aria-activedescendant=optionId
ArrowDown/Up moves highlight; Enter selects; Escape closes; click-outside closes

// Modal/sheet
open → store document.activeElement; focus close control; lock body scroll; aria-modal=true
Escape / close → restore focus; unlock scroll

// Pointer / motion CSS contracts
@media (hover: hover) and (pointer: fine) { /* hover previews */ }
@media (hover: none) { /* tap / inline expand */ }
@media (prefers-reduced-motion: reduce) { /* static or scroll-snap; no infinite marquees */ }
```

**Acceptance:**

- [ ] Multi-step flows share one step-state source.
- [ ] Combobox is keyboard-only operable.
- [ ] Touch and reduced-motion users are not blocked by hover/animation-only UX.

---

### M20. Capped multi-segment blend

**When:** Blends of N secondary weights must not let a long tail dominate.

**Invariants:**

- Keep top `max` positive-weight segments (typical `max = 3`), renormalize to sum 1.
- Pure helper; no vertical catalogs in Product Core.
- Sibling to §M6: M20 = cardinality cap; M6 = cross-instrument delta cap.

**Build — algorithm `capSegmentBlend(weights, max = 3)`:**

```text
entries = [(k, w) for k,w in weights if w > 0]
if entries empty → return {}

Sort entries by w descending, then key ascending
Keep first max entries (or all if fewer)
S = Σ kept weights
if S ≤ 0 → return {}
return { k: w/S for each kept }    // sums to 1.0
```

Headless tests: truncate+renormalize; empty/all-zero → `{}`; tie-break stable by key.

**Acceptance:**

- [ ] >`max` positive keys truncate then renormalize.
- [ ] Empty/all-zero → empty blend.
- [ ] Headless test covers truncate + renormalize.

---

### M21. Showcase / portfolio demo mode

**When:** Same tree ships a public demo without live client secrets, and remains deployable as a real fork.

**Invariants:**

- Build-time flag (e.g. `VITE_SHOWCASE_MODE=true`) selects a **fictional** Client Pack overlay.
- Showcase uses simulated backend (local storage / stub endpoint); live builds use real adapters + secrets.
- Demo chrome flag-gated; absent in production client forks.
- CI can deploy demos without production credentials.

**Build:** Showcase flag, fictional brand overlay, storage/stub adapters, gated demo chrome.

**Acceptance:**

- [ ] Showcase build needs no live Apps Script/Firebase secrets.
- [ ] Flag off → real Client Pack + real adapters, no demo chrome.
- [ ] Product Core paths shared; only config/labels/backends diverge.
- [ ] Showcase strings are fictional—no prior client leakage.

---

### M22. CI brand-leak + SEO/indexing gates

**When:** Marketing/demo deploys from CI and silent brand/SEO regressions would ship.

**Invariants:**

- CI fails on template icon/color fingerprints (e.g. default purple `863bff`) and leftover template brand tokens (§J3 list).
- Every marketing HTML route asserts title, description, robots, canonical, OG, Twitter, JSON-LD before publish.
- `robots.txt` allows marketing; Disallows demo/app paths; sitemap is marketing-only.
- Complements §H and §J3.

**Build:** CI job steps for fingerprint ban, per-page meta asserts, robots/sitemap checks. Prefer `wl check-brand` + `wl check-seo` (toolkit CI workflow is the reference implementation).

**Acceptance:**

- [ ] Forbidden fingerprint fails CI.
- [ ] Missing canonical/OG/JSON-LD fails CI.
- [ ] Demo/app paths Disallow’d and absent from sitemap.
- [ ] Cutover requires green brand/SEO gates (`wl cutover` / Phase 7).

---

### M23. Domain terminology map

**When:** UI nouns must match the client vertical without forking features or permission keys.

**Invariants:**

- Stable permission/feature keys stay neutral Product Core; UI nouns in one terminology module.
- Auth claims stay canonical (`admin` / `trainer` / `member` / …); display names from Client Pack helpers (§B3).
- Showcase (§M21) or client overlay may swap the whole label map without editing mutations/rules/features.

**Build — label map:**

```text
labels = {
  // nav / entities / empty states / CTAs — Client Pack swaps values
  appName, entityPlural, entitySingular, addEntity, noEntities, …
  // sync / import chrome if M18/M24 in scope
  retrySync, discardSyncQueue, importPending, …
}

getRoleDisplayName(claim) → Client Pack map
  admin → "Owner" | "Director" | …
  trainer → "Coach" | "Instructor" | …
  member → "Client" | "Member" | …

Features import `labels.*` only — never hardcode vertical nouns in JSX/mutations/rules.
Permission checks use stable keys ("canEditHousehold"-style Product Core ids), not display strings.
```

**Acceptance:**

- [ ] Terminology change updates nav/empty states/CTAs without feature logic edits.
- [ ] Permissions use stable keys, not display labels.
- [ ] Claim names in rules/callables unchanged when UI labels change.

---

### M24. Subscription-free public → adapter → Sheet/Calendar → staff CRM (optional stack)

**When:** Public booking/enquiry without §§A–L Firestore roster capacity, on near-zero ongoing backend cost.

**Invariants:**

- Shape: public SPA → Apps Script `doPost` → Sheet (audit/import queue) + Calendar (availability) → optional Firebase staff CRM.
- **SoT choice:** Calendar + Sheet own public availability/submissions for this stack. Does **not** overturn §A Firestore-SoT for studio roster pivots unless human selects this stack.
- Always include §M14 lineage and §M15 abuse controls.
- Pair with §M13 when multi-site commute applies.
- Do not paste facility/vertical Sheet schemas into unrelated clients.

**Build — stack shape:**

```text
Public SPA
  → POST text/plain JSON { action, …fields, website="", turnstile_token? }
  → Apps Script doPost
       §M15 abuse checks → dispatch:
         availability → Calendar free/busy (+ §M13 commute if multi-site) → slot list
         book → create Calendar event (+ optional addGuest) → append Sheet row (lineage order)
         enquiry / lookup_returning → mail NOTIFY_EMAIL / read Sheet; no open relay
  → Staff CRM (optional Firebase/RTDB)
       list pending Sheet rows (trainerImported flag)
       fuzzy household match → import/dismiss → mark imported

Privacy note: this stack may guest the client on the shared calendar (invite).
That differs from §A “members are not calendar guests.” Document the choice per pivot.
```

**Acceptance:**

- [ ] Human explicitly chose Calendar/Sheet SoT (or documented exception).
- [ ] Public submit → Sheet (+ Calendar when applicable) → staff import works E2E.
- [ ] §M14 and §M15 present on the public adapter.
- [ ] No vertical facility/dog content required to reuse the shape.

---

## L. Appendix

### L1. Changelog vs original instruction-set outline

Expanded into a **full project prompt** (not a Cursor Skill) with:

- Self-containment rule: execute from this file alone; discover host paths—no sibling docs or assumed filenames
- True white-label Client Pack vs Product Core (brand/style/language unique per project)
- Code layering rules and leakage audit
- Database content-vs-schema contract and per-client Firebase tenancy
- CSS reuse via tokens / theme class (not widget forks)
- Metadata & SEO as a first-class phase (**§H authoritative**, no sibling SEO doc required)
- Role names aligned to code (`admin` / `trainer` / `member`)
- Env **names**, callable/trigger map, and acceptance matrix for the booking template family
- Acceleration preferences for efficient future pivots
- **Machine-readable intake** (`client.config.json` schema) + optional `@whitelabel/pivot-kit` (`wl`) for generate, brand/SEO gates, provision, E2E smoke, cutover, and **template lineage** (§D3 / §K7–K10)—contracts remain in this file; toolkit is execution, not a sibling playbook
- **Kickoff interview** (§L3): single message (brand + industry) → Plan-mode Q&A (stack / surfaces / add-ons / terminology / brand gaps / infra boundary) → CreatePlan for in-repo build; Firebase / Apps Script / Calendar / secret values stay human
- **§M optional patterns** fully specified in-file (When / Invariants / Build / Acceptance)—no cross-repo Reference paths. **§M1** embeds implementable redistribution math (integer tenths, floor+lex even split, D’Hondt spread, stagnation guard, deferred commit, dimensions/modes, starved-zero disable); **§M4/M5/M20** embed autosave, range-guard, and blend-cap algorithms; **§M13–M19** embed commute/haversine slot math, field-lineage schema, public abuse pipeline, assessment→lead handoff TTL contract, SSG `seo-ready` prerender handshake, offline mutate/queue, and thin form/UX step/combobox/modal contracts (harvested domain-agnostically). Vertical content packs and non-transferable chrome deliberately excluded.

### L2. Source prompt (original outline)

The following was the starting instruction set; this document supersedes it for execution.

```text
Inspect this entire repository—including frontend assets, component structures,
styling files, custom widget logic, backend server logic, Google Apps Script files,
Firestore setup, and authentication roles.

I want to create a comprehensive, reusable Agent Skill that acts as a step-by-step
"White-Labeling, Rebranding & UI/UX Adaptation Playbook". This skill will allow us
to rapidly pivot this existing application architecture (booking engine, custom widget
interactions, multi-tier RBAC, Google Calendar sync, Apps Script email workflows, and
Firestore setup) for a completely new client or business entity.

Analyze the codebase thoroughly—do not rely solely on my description—and uncover all
hidden dependencies, API keys, design patterns, and visual components.

Please generate a structured `.cursor/skills/white-label-deployment/SKILL.md` file
containing:

1. App Architecture & Data-Flow Map:
   - High-level overview of how the web app, custom interactive widgets, Firestore,
     Google Calendar API, Apps Script mailers, and role levels (Admin, Elevated,
     Regular Users) interface.
   - Mapping of state handoffs (e.g., widget slot selection -> Firestore write ->
     Apps Script trigger -> Calendar sync).

2. UI/UX, Style & Custom Widget Audit:
   - Design System Tokens: Location of primary/secondary color palettes, typography
     specs, border radii, shadows, and spacing variables (CSS variables, Tailwind
     config, or theme objects).
   - Component & Layout Catalog: Structural layout templates for Admin, Elevated, and
     Public/Client views (e.g., sidebars, navigation bars, multi-step booking flows).
   - Custom Interactive Widgets: Map all custom UI widgets (e.g., date/time pickers,
     interactive calendar grids, multi-function slot selectors, modal dialogs, status
     badges). Document their state machines, custom behaviors, and how to re-theme or
     alter their layout variants for different brand styles.

3. Variable, Asset & Environment Audit:
   - Catalog all hardcoded strings, brand names, support phone numbers/emails, domains,
     logos, favicons, hero graphics, and UI icons.
   - List every `.env` variable, API key, OAuth Client ID, Google Workspace account ID,
     and webhook URL used across frontend and backend.
   - Audit email/SMS templates embedded in code or Apps Script for brand references
     and styling.

4. Complete Provisioning & Pivot Procedure:
   - Design Re-skinning & Layout Customization: Step-by-step procedure to update design
     tokens, swap icon sets, adjust widget layout variants, and apply a new visual
     identity.
   - GCP & Firebase Setup: Step-by-step for setting up a fresh Firebase project, initial
     collection seeds, composite index definitions (`firestore.indexes.json`), and
     security rules (`firestore.rules`) matching the 3-tier RBAC system.
   - Google Workspace & Apps Script Deployment: OAuth credential creation, required API
     scopes, service account setup, Apps Script project cloning/deployment, web app
     trigger authorization, and Calendar ID bindings.
   - DNS, Domain & Auth Configuration: Custom domain mapping, Firebase Auth authorized
     domains setup, CORS settings, and SSL certificate propagation steps.

5. Edge-Case & "Invisible Friction" Checklist:
   - Timezone & Regional Localization: Instructions for adjusting default timezones,
     date formats, currency symbols, and local operating hours across scheduling
     functions and widgets.
   - Token & Webhook Revocation: Steps to flush existing auth tokens, clear legacy
     cache/session state, and verify new API keys.
   - Mobile vs. Desktop Responsiveness: Specific widget layout breakpoints or
     touch-interaction overrides to verify during rebranding.

6. Verification & Deployment Checklist:
   - End-to-end testing matrix covering: Admin privilege escalation, Elevated user
     scheduling overrides, Regular user slot bookings, custom widget UI state changes,
     synced Google Calendar event accuracy, and Apps Script confirmation delivery.

Format the output strictly as a structured SKILL.md file with YAML frontmatter
(including relevant `description` keywords) so the Cursor agent can automatically load
and execute this procedure whenever we prompt it to rebrand or pivot this app for a
new client.
```

### L3. How to use this file

This file is the operating prompt—do not require other playbooks. Copy it (with the engagement rule and toolkit) into a host repo. A **single message** with brand material and industry explanation is enough to start.

#### Kickoff & planning interview

**Trigger:** User mentions white-label / new client / rebrand, or pastes brand + industry prose (complete or partial).

**Agent must:**

1. Stay in / switch to **Plan mode** — do not write product code until a plan is approved.
2. Extract what was already given (name, place, vertical, URLs, logos, voice) into a scratch list; do not invent a full Client Pack from guesses.
3. Interview in **batches of 1–2 questions**, plain language (no “§B3” / “§M24” jargon in questions to the human).
4. After answers: write `engagement-answers.json`, run `wl intake apply-answers` when the toolkit is present, then **CreatePlan** for **in-repo build only**.
5. Plan non-goals: live `firebase projects:create`, clasp login/deploy, DNS, and secret **values**. Those stay human via `wl intake checklist` / provision residuals.

**Interview script (fixed order):**

| Step | Ask in plain language | Maps to |
|------|----------------------|---------|
| **S1** | Is this mainly **booking people into time slots**, a **public form that lands in a spreadsheet/calendar**, or **both**? | Stack: §§A–L / §M24 / hybrid |
| **S2** | Which parts do you need: public website, customer login app, staff console, email/calendar notifications, manual payment flags? | C1 surfaces; mark N/A |
| **S3** | Any add-ons (say yes/no): quizzes/scoring, multi-location travel times, demo/showcase mode, automated brand/SEO checks in CI? Only offer what fits the chosen stack. | §M0 selection |
| **S4** | What words should customers see for staff, customers, and bookings? (e.g. Coach vs Mediator) | §M23 / B3 |
| **S5** | Fill brand gaps only: domain, email, phone, logo/colors if missing. Propose locale defaults when place is clear (e.g. Golden Bay → NZ). | B1–B5 residuals |
| **S6** | Confirm: we’ll build the app **in this repo**; you set Firebase, Apps Script, Calendar, and GitHub secrets yourself using generated checklists — OK? | Deferred infra boundary |

- **Booking pivots:** §§A–L; skip §M unless S3 selected patterns.
- **§M patterns:** apply only matching subsections; keep math brand-free; labels in Client Pack.
- **Transfer to another repo:** keep this file self-contained; map surfaces onto the host tree by discovery; do not reintroduce sibling playbooks or assumed filenames; keep Client Pack / Product Core / acceptance rules.
- Do not ship vertical content packs or prior-brand identity into unrelated clients.
- Generated `REBRAND_PROMPT.md` is apply guidance after S1–S6 + approved plan — never a replacement for the relevance-check interview.
- Generated `REBRAND_PROMPT.md` is apply guidance after S1–S6 + approved plan — never a replacement for the relevance-check interview.
