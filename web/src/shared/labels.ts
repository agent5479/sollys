import { brand, getRoleDisplayName } from "../pack/brand";

export const labels = {
  appName: brand.name,
  entitySingular: "consignment",
  entityPlural: "consignments",
  addEntity: "Add consignment",
  noEntities: "No consignments yet.",
  booking: "booking",
  bookingPlural: "bookings",
  trackCta: "Track a consignment",
  scanCta: "Scan consignment",
  leftoverCta: "Reserve leftover space",
  retrySync: "Retry sync",
  discardSyncQueue: "Discard queued scans",
  importPending: "Queued locally",
} as const;

export { getRoleDisplayName, brand };
