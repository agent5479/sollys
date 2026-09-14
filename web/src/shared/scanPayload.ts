/** Turn a scanned string into a tracking code (raw label or Track URL). */
export function normalizeScanPayload(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed, typeof window !== "undefined" ? window.location.origin : "https://example.local");
    const code = url.searchParams.get("code");
    if (code?.trim()) return code.trim().toUpperCase();
  } catch {
    /* not URL-like */
  }

  const match = /[?&]code=([^&#]+)/i.exec(trimmed);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]).trim().toUpperCase();
    } catch {
      return match[1].trim().toUpperCase();
    }
  }

  return trimmed.toUpperCase();
}

export function trackPageUrl(code: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://example.local";
  return new URL(`track?code=${encodeURIComponent(code.trim().toUpperCase())}`, `${origin}${base}`).href;
}

export const DEMO_LABEL_CODES = ["SL-4821", "SL-4823"] as const;
