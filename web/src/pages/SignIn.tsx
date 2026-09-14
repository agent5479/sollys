import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../Shell";
import { homeFor, signIn, signOut } from "../session";
import { DEMO_PASSWORD, users } from "../shared/seeds";
import { getRoleDisplayName } from "../shared/labels";
import type { Claim } from "../shared/types";

const ROLE_ORDER: Claim[] = ["admin", "trainer", "member"];

export function SignInPage() {
  const nav = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState(users[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");

  function enterAs(claim: Claim) {
    const u = users.find((x) => x.claim === claim);
    if (!u) return;
    signOut();
    signIn(u.email, u.password);
    nav(homeFor(u.claim));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const user = signIn(email, password);
      nav(homeFor(user.claim));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    }
  }

  return (
    <Shell noindex variant="marketing">
      <section className="section">
        <div className="wrap" style={{ maxWidth: 640 }}>
          <p className="kicker">Demo sign-in</p>
          <h1 className="display">Choose a role</h1>
          <p className="muted">
            One-click for the pitch. Password for all demo users is {DEMO_PASSWORD}.
          </p>
          <div className="role-cards">
            {ROLE_ORDER.map((claim) => {
              const u = users.find((x) => x.claim === claim)!;
              const blurb =
                claim === "admin"
                  ? "Live map, consignments, fleet GPS"
                  : claim === "trainer"
                    ? "Scan labels and tag location"
                    : "Track leftover space (secondary)";
              return (
                <button
                  key={claim}
                  type="button"
                  className="role-card"
                  onClick={() => enterAs(claim)}
                >
                  <span className="role-card-title">{getRoleDisplayName(claim)}</span>
                  <span className="muted">{u.displayName}</span>
                  <span className="role-card-blurb">{blurb}</span>
                </button>
              );
            })}
          </div>
          <p style={{ marginTop: "1.25rem" }}>
            <button type="button" className="linkish" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Hide email form" : "Use email form"}
            </button>
          </p>
          {showForm ? (
            <form className="card" onSubmit={onSubmit} style={{ marginTop: "0.75rem" }}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? <p>{error}</p> : null}
              <button className="btn btn-ink" type="submit">
                Sign in
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}
