/**
 * Vehicle GPS adapter — simulated corridor motion for the pitch.
 * Swap `fetchVehiclePositions` for a Geotab / Samsara / webhook client later
 * without changing Ops map UI.
 */
import type { VehiclePosition } from "./types";
import { ROUTE_POINTS, trucks } from "./seeds";

export type VehicleGpsAdapter = {
  source: "simulated" | "telematics";
  listPositions(): Promise<VehiclePosition[]>;
};

/** Progress 0–1 along corridor, offset per truck so they spread out. */
function pointAlong(progress: number): { lat: number; lng: number; heading: number } {
  const segs = ROUTE_POINTS.length - 1;
  const t = Math.min(0.999, Math.max(0, progress)) * segs;
  const i = Math.floor(t);
  const f = t - i;
  const a = ROUTE_POINTS[i];
  const b = ROUTE_POINTS[Math.min(i + 1, ROUTE_POINTS.length - 1)];
  const lat = a.lat + (b.lat - a.lat) * f;
  const lng = a.lng + (b.lng - a.lng) * f;
  const heading = (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI;
  return { lat, lng, heading };
}

export function simulatedVehiclePositions(now = Date.now()): VehiclePosition[] {
  // ~40 minute lap so positions visibly move during a meeting
  const cycleMs = 40 * 60 * 1000;
  return trucks.slice(0, 4).map((truck, index) => {
    const phase = (now / cycleMs + index * 0.22) % 1;
    const pos = pointAlong(phase);
    return {
      id: `vp-${truck.id}`,
      truckId: truck.id,
      label: truck.plate ?? truck.name,
      lat: pos.lat,
      lng: pos.lng,
      heading: pos.heading,
      at: new Date(now).toISOString(),
      source: "simulated" as const,
    };
  });
}

export const vehicleGpsAdapter: VehicleGpsAdapter = {
  source: "simulated",
  async listPositions() {
    return simulatedVehiclePositions();
  },
};
