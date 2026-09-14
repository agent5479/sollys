import type { Booking, Connector, Scan, TrackingView } from "./types";
import { loadState, newId, updateState } from "./store";
import { brand } from "./labels";

const SHOWCASE = import.meta.env.VITE_SHOWCASE_MODE !== "false";

function trackingFor(code: string): TrackingView | null {
  const s = loadState();
  const consignment = s.consignments.find(
    (c) => c.trackingCode.toUpperCase() === code.trim().toUpperCase(),
  );
  if (!consignment) return null;
  const scans = s.scans
    .filter((sc) => sc.consignmentId === consignment.id)
    .sort((a, b) => a.at.localeCompare(b.at));
  return { consignment, scans, last: scans[scans.length - 1] };
}

const showcase: Connector = {
  async listConsignments() {
    return loadState().consignments;
  },
  async getTracking(code) {
    return trackingFor(code);
  },
  async scanConsignment(input) {
    const code = input.code.trim().toUpperCase();
    let scan: Scan | undefined;
    updateState((s) => {
      let consignment = s.consignments.find((c) => c.trackingCode === code);
      if (!consignment) {
        consignment = {
          id: newId("c"),
          trackingCode: code,
          description: "Scanned in the field",
          status: "in_transit",
          originDepotId: "takaka",
          destDepotId: "richmond",
          weightKg: 0,
          cubeM3: 0,
        };
        s.consignments.push(consignment);
      } else {
        consignment.status = "in_transit";
      }
      scan = {
        id: newId("s"),
        consignmentId: consignment.id,
        driverId: input.driverId,
        lat: input.lat,
        lng: input.lng,
        at: new Date().toISOString(),
        labelCode: code,
        pending: typeof navigator !== "undefined" && !navigator.onLine,
      };
      if (scan.pending) s.pendingScans.push(scan);
      s.scans.push(scan);
      s.outbox.unshift({
        id: newId("m"),
        at: scan.at,
        subject: `Scan ${code}`,
        body: `Driver tagged ${code} at ${scan.lat.toFixed(4)}, ${scan.lng.toFixed(4)}.`,
        to: brand.notifyEmail,
      });
    });
    if (!scan) throw new Error("Scan failed");
    return scan;
  },
  async listFleet() {
    return loadState().trucks;
  },
  async reserveCapacity(input) {
    let booking: Booking | undefined;
    updateState((s) => {
      const truck = s.trucks.find((t) => t.id === input.truckId);
      if (!truck) throw new Error("Run not found");
      const remainKg = truck.capacityKg - truck.usedKg;
      const remainM3 = truck.capacityM3 - truck.usedM3;
      if (input.weightKg > remainKg || input.cubeM3 > remainM3) {
        throw new Error("Not enough leftover space on this run");
      }
      truck.usedKg += input.weightKg;
      truck.usedM3 += input.cubeM3;
      booking = {
        id: newId("b"),
        truckId: truck.id,
        clientId: input.clientId,
        weightKg: input.weightKg,
        cubeM3: input.cubeM3,
        notes: input.notes,
        at: new Date().toISOString(),
      };
      s.bookings.push(booking);
      s.outbox.unshift({
        id: newId("m"),
        at: booking.at,
        subject: `Booking on ${truck.name}`,
        body: `Leftover space reserved: ${input.weightKg} kg / ${input.cubeM3} m³ on ${truck.run}.`,
        to: brand.notifyEmail,
      });
    });
    if (!booking) throw new Error("Booking failed");
    return booking;
  },
};

export const firestoreConnector: Connector = {
  async listConsignments() {
    throw new Error("Firestore not wired — pitch uses showcase mode");
  },
  async getTracking() {
    throw new Error("Firestore not wired — pitch uses showcase mode");
  },
  async scanConsignment() {
    throw new Error("Firestore not wired — pitch uses showcase mode");
  },
  async listFleet() {
    throw new Error("Firestore not wired — pitch uses showcase mode");
  },
  async reserveCapacity() {
    throw new Error("Firestore not wired — pitch uses showcase mode");
  },
};

export const connector: Connector = SHOWCASE ? showcase : firestoreConnector;

export function flushPendingScans(): number {
  let n = 0;
  updateState((s) => {
    n = s.pendingScans.length;
    for (const sc of s.pendingScans) sc.pending = false;
    s.pendingScans = [];
  });
  return n;
}
