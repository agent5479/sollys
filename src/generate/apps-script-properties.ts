import type { ClientConfig } from "../types.js";

export interface AppsScriptProperties {
  NOTIFY_EMAIL: string;
  CALENDAR_ID: string;
  FUNCTIONS_WEBHOOK_SECRET: string;
  AUDIT_SPREADSHEET_ID: string;
  BRAND_SHORT: string;
  BRAND_NAME: string;
  CLIENT_ORIGIN: string;
  MANAGE_BOOKING_URL: string;
  VENUE_DEFAULT: string;
  PRODID: string;
  UID_DOMAIN: string;
  TIME_ZONE: string;
}

export function generateAppsScriptProperties(
  cfg: ClientConfig,
): AppsScriptProperties {
  const host = new URL(cfg.brand.origin).hostname;
  const venue = cfg.brand.venues[0]?.name ?? cfg.brand.name;
  return {
    NOTIFY_EMAIL: cfg.brand.notifyEmail,
    CALENDAR_ID: "",
    FUNCTIONS_WEBHOOK_SECRET: "",
    AUDIT_SPREADSHEET_ID: "",
    BRAND_SHORT: cfg.brand.shortName,
    BRAND_NAME: cfg.brand.name,
    CLIENT_ORIGIN: cfg.brand.origin,
    MANAGE_BOOKING_URL: `${cfg.brand.origin}${cfg.brand.appBase}`,
    VENUE_DEFAULT: venue,
    PRODID: `-//${cfg.brand.shortName}//EN`,
    UID_DOMAIN: host,
    TIME_ZONE: cfg.locale.timeZone,
  };
}
