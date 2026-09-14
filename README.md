# @whitelabel/pivot-kit

Standalone toolkit for white-label pivots. Contracts live in [`whitelabel.md`](whitelabel.md); this package executes them. Engagement flow is enforced by [`.cursor/rules/whitelabel-engagement.mdc`](.cursor/rules/whitelabel-engagement.mdc) and [`AGENTS.md`](AGENTS.md).

## Transfer into a host repo

1. Copy into the host (or install this package from path):
   - `whitelabel.md`
   - `.cursor/rules/whitelabel-engagement.mdc`
   - `AGENTS.md`
   - this toolkit (`package.json` / `src` / `schemas` / `examples`, or `npm pack` + install)
2. Open the host in Cursor. Send **one message** with brand material + industry explanation.
3. Answer the Plan-mode interview (stack → surfaces → add-ons → wording → brand gaps → infra boundary).
4. Approve the in-repo build plan and execute (`wl intake apply-answers` → `wl validate` → `wl generate` → apply artifacts).
5. **Separately (human):** Firebase Auth/project, Apps Script + Calendar, DNS, and CI secret **values** — use `wl intake checklist` (never commit secrets).

## Quick start

```bash
npm install
npm run wl -- validate --config examples/client.config.example.json
npm run wl -- intake apply-answers --answers examples/engagement-answers.example.json --out .tmp/client.config.json --strict
npm run wl -- generate --config examples/client.config.example.json --out .tmp/generated
npm run wl -- intake checklist --config examples/client.config.example.json
npm run wl -- check-brand --previous examples/previous-brand.tokens.json --root fixtures/brand-clean
npm run wl -- e2e
```

Example intake configs (Acme, etc.) are **CLI demos only** — not Product Core and not template identity. Brand placeholders ship in-kit under `templates/brand/`. Optional scrub example for future forks: `examples/previous-brand.example-prior.json`.

## Commands

| Command | Purpose |
|---------|---------|
| `wl intake init -o client.config.json` | TODO draft config + default features / empty structural slots |
| `wl intake apply-answers -a engagement-answers.json` | Interview dump → draft `client.config.json` (after §L3 S1–S6) |
| `wl intake checklist [-c config]` | Human Firebase / Apps Script / Calendar / secrets list |
| `wl validate -c client.config.json` | §B6 execute gate (+ productCore for booking) |
| `wl generate -c … -o generated/ [--host-map …]` | Theme, split envs, Script Properties, brand module, SEO, seeds skeleton, brand assets, REBRAND_PROMPT |
| `wl check-brand` / `wl check-seo` | Brand-leak and SEO pack gates |
| `wl lineage stamp` | Template lineage |
| `wl discover` / `wl provision` | Host map + human-gated provision |
| `wl cutover` | Phase 7 hygiene |
| `wl e2e` / `wl e2e --full` | §J2 smoke / Playwright full |

## Practical limits

- Google billing, DNS, Search Console, and first `firebase` / `clasp` login stay human.
- Provision assumes a host product tree with rules/functions/adapter source.
- `wl e2e --full` needs a deployed client, Playwright browsers, and seeded users.
- Engagement relevance checks (S1–S6) remain mandatory; generate artifacts do not skip them.

## Lineage

Each `client.config.json` should carry `templateLineage.upstreamCommit`. After backporting core fixes: diff against that SHA, run `check-brand`, bump with `wl lineage stamp`.
