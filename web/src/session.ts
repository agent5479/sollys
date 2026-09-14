import type { Claim, DemoUser } from "./shared/types";
import { loadState } from "./shared/store";

const KEY = "sollys-session";

export function currentUser(): DemoUser | null {
  if (typeof sessionStorage === "undefined") return null;
  const id = sessionStorage.getItem(KEY);
  if (!id) return null;
  return loadState().users.find((u) => u.id === id) ?? null;
}

export function signIn(email: string, password: string): DemoUser {
  const user = loadState().users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) throw new Error("Those demo details are not on the list.");
  sessionStorage.setItem(KEY, user.id);
  return user;
}

export function signOut(): void {
  sessionStorage.removeItem(KEY);
}

export function homeFor(claim: Claim): string {
  if (claim === "admin") return "/app/ops";
  if (claim === "trainer") return "/app/driver";
  return "/app/client";
}
