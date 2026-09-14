/** Depot travel times — brand-free numbers (M13 commute helper). */

export const SLOT_INTERVAL_MINUTES = 15;
export const TRANSITION_MINUTES = 5;
export const COMMUTE_SPEED_KMH = 48;

export interface LatLng {
  lat: number;
  lng: number;
}

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function commuteMinutes(from: LatLng & { id?: string }, to: LatLng & { id?: string }): number {
  if (from.id && to.id && from.id === to.id) return TRANSITION_MINUTES;
  const km = haversineKm(from, to);
  const raw = (km / COMMUTE_SPEED_KMH) * 60;
  return Math.max(
    TRANSITION_MINUTES,
    Math.ceil(raw / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES,
  );
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
