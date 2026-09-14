# Client assumptions

Authorized gaps for execute (human confirmed). Fill or remove as real intake arrives.

## Industry notes

South Island freight, livestock, storage, and contracting. This fork is a **pitch**: driver scan + GPS locate, public track-by-code, leftover truck-space booking, fleet schedule, and a simple capacity calculator. The showcase store is source of truth. Firestore connectors are placeholders. Multi-user is simulated.

## Gaps

- Live Firebase project `sollys-prod` is a **name only** — do not invent project IDs, API keys, or Auth domains in git.
- Apps Script, Calendar ID, webhook secrets, and DNS are undeployed. Use `wl intake checklist`.
- This working copy has no `.git` directory; `templateLineage.upstreamCommit` is a 40-zero placeholder until a human initialises the repo and stamps a real SHA.
- Colour tokens were sampled from the public Sollys site (forest green banner, gold truck lettering, cream paper) rather than a supplied brand kit.
- Public origin is `https://www.sollys.co.nz` for SEO/JSON-LD; the pitch app runs on localhost until hosting is wired.
- Leftover-capacity booking is a thin reservation, not studio roster/season/ICS math.
- Email/calendar are in-app stubs; no SMS.
- Camera/GPS may be denied in the browser — always keep manual consignment code + simulate-GPS.
- Public Sollys copy is paraphrased, not scraped in bulk.
- Depot operating hours are not published uniformly; UI uses “confirm with the local depot.”
- Named contact Merv Solly / Owner comes from the public Sollys Story page.
