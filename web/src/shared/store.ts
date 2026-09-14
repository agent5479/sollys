import type { ShowcaseState } from "./types";
import { seedState } from "./seeds";

const KEY = "sollys-showcase-v1";

const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

export function loadState(): ShowcaseState {
  if (!canUseStorage()) return seedState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as ShowcaseState;
    if (!parsed.consignments?.length) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export function saveState(state: ShowcaseState): void {
  if (canUseStorage()) localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn());
}

export function resetState(): ShowcaseState {
  const next = seedState();
  saveState(next);
  return next;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function updateState(mut: (s: ShowcaseState) => void): ShowcaseState {
  const s = loadState();
  mut(s);
  saveState(s);
  return s;
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}
