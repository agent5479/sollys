/**
 * Placeholder HTTPS callables — names match the pitch connector interface.
 * Do not deploy until a human creates Firebase project sollys-prod.
 * Showcase mode in web/ does not call these.
 */

export function notWired(name: string): never {
  throw new Error(`${name}: Firestore not wired — pitch uses showcase mode`);
}

export async function listConsignments() {
  notWired("listConsignments");
}

export async function getTracking() {
  notWired("getTracking");
}

export async function scanConsignment() {
  notWired("scanConsignment");
}

export async function listFleet() {
  notWired("listFleet");
}

export async function reserveCapacity() {
  notWired("reserveCapacity");
}
