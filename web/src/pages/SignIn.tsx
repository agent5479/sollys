import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../Shell";
import { homeFor, signIn } from "../session";
import { DEMO_PASSWORD, users } from "../shared/seeds";
import { getRoleDisplayName } from "../shared/labels";

export function SignInPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState(users[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");

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
    <Shell noindex>
      <section className="section">
        <div className="wrap" style={{ maxWidth: 520 }}>
          <p className="kicker">Showcase sign-in</p>
          <h1 className="display">Open the app</h1>
          <p className="muted">Password for every demo user is {DEMO_PASSWORD}. No Google sign-in.</p>
          <form className="card" onSubmit={onSubmit} style={{ marginTop: "1rem" }}>
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
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Demo users</h3>
            <ul>
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    className="btn btn-line"
                    style={{ margin: "0.25rem 0" }}
                    onClick={() => {
                      setEmail(u.email);
                      setPassword(DEMO_PASSWORD);
                    }}
                  >
                    {getRoleDisplayName(u.claim)} — {u.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Shell>
  );
}
