export type Claim = "admin" | "trainer" | "member";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Depot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  displayName: string;
  claim: Claim;
  depotId?: string;
}

export type ConsignmentStatus = "at_depot" | "in_transit" | "delivered";

export interface Consignment {
  id: string;
  trackingCode: string;
  description: string;
  status: ConsignmentStatus;
  originDepotId: string;
  destDepotId: string;
  truckId?: string;
  weightKg: number;
  cubeM3: number;
}

export interface Scan {
  id: string;
  consignmentId: string;
  driverId: string;
  lat: number;
  lng: number;
  at: string;
  labelCode: string;
  note?: string;
  pending?: boolean;
}

export interface Truck {
  id: string;
  name: string;
  capacityKg: number;
  capacityM3: number;
  usedKg: number;
  usedM3: number;
  run: string;
  fromDepotId: string;
  toDepotId: string;
  departLabel: string;
}

export interface Booking {
  id: string;
  truckId: string;
  clientId: string;
  weightKg: number;
  cubeM3: number;
  notes: string;
  at: string;
}

export interface OutboxItem {
  id: string;
  at: string;
  subject: string;
  body: string;
  to: string;
}

export interface ShowcaseState {
  users: DemoUser[];
  depots: Depot[];
  consignments: Consignment[];
  scans: Scan[];
  trucks: Truck[];
  bookings: Booking[];
  outbox: OutboxItem[];
  pendingScans: Scan[];
}

export interface TrackingView {
  consignment: Consignment;
  scans: Scan[];
  last?: Scan;
}

export interface Connector {
  listConsignments(): Promise<Consignment[]>;
  getTracking(code: string): Promise<TrackingView | null>;
  scanConsignment(input: {
    code: string;
    driverId: string;
    lat: number;
    lng: number;
  }): Promise<Scan>;
  listFleet(): Promise<Truck[]>;
  reserveCapacity(input: {
    truckId: string;
    clientId: string;
    weightKg: number;
    cubeM3: number;
    notes: string;
  }): Promise<Booking>;
}
