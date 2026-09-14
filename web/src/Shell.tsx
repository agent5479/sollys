import { NavLink, Link, useLocation } from "react-router-dom";
import { brand, getRoleDisplayName } from "./shared/labels";
import { currentUser, homeFor, signOut } from "./session";
import type { ReactNode } from "react";

export function Shell({
  children,
  noindex,
  variant = "auto",
}: {
  children: ReactNode;
  noindex?: boolean;
  /** marketing = public site chrome; app = signed-in ops chrome */
  variant?: "auto" | "marketing" | "app";
}) {
  const user = currentUser();
  const loc = useLocation();
  const isMarketingPath =
    loc.pathname === "/" || loc.pathname.startsWith("/track");
  const mode =
    variant === "auto"
      ? user && !isMarketingPath
        ? "app"
        : "marketing"
      : variant;

  return (
    <div className={mode === "app" ? "shell-app" : "shell-marketing"}>
      {noindex ? <meta name="robots" content="noindex,follow" /> : null}
      <header className="site-header">
        <Link className="brand-mark" to={user ? homeFor(user.claim) : "/"}>
          <img src="/brand/logo-light.svg" alt="" />
          <strong>{brand.shortName}</strong>
        </Link>
        <nav>
          {mode === "marketing" ? (
            <>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
                Home
              </NavLink>
              <NavLink to="/track" className={({ isActive }) => (isActive ? "active" : undefined)}>
                Track
              </NavLink>
              {user ? (
                <NavLink
                  to={homeFor(user.claim)}
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                >
                  {getRoleDisplayName(user.claim)}
                </NavLink>
              ) : (
                <NavLink
                  to="/app/signin"
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                >
                  Sign in
                </NavLink>
              )}
            </>
          ) : (
            <>
              {user?.claim === "admin" ? (
                <>
                  <NavLink
                    to="/app/ops"
                    end
                    className={({ isActive }) => (isActive ? "active" : undefined)}
                  >
                    Live map
                  </NavLink>
                  <NavLink
                    to="/app/ops/consignments"
                    className={({ isActive }) => (isActive ? "active" : undefined)}
                  >
                    Consignments
                  </NavLink>
                  <NavLink
                    to="/app/ops/fleet"
                    className={({ isActive }) => (isActive ? "active" : undefined)}
                  >
                    Fleet
                  </NavLink>
                </>
              ) : null}
              {user?.claim === "trainer" ? (
                <NavLink
                  to="/app/driver"
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                >
                  Scan
                </NavLink>
              ) : null}
              {user?.claim === "member" ? (
                <NavLink
                  to="/app/client"
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                >
                  Bookings
                </NavLink>
              ) : null}
              <NavLink to="/track" className={({ isActive }) => (isActive ? "active" : undefined)}>
                Track
              </NavLink>
              <NavLink
                to="/app/signin"
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                Switch role
              </NavLink>
              {user ? (
                <button
                  className="btn btn-line"
                  type="button"
                  onClick={() => {
                    signOut();
                    window.location.assign("/app/signin");
                  }}
                >
                  Sign out
                </button>
              ) : null}
            </>
          )}
        </nav>
      </header>
      {children}
      {mode === "marketing" ? (
        <footer className="site-footer">
          <div className="wrap">
            {brand.copyrightText} · {brand.phone} · {brand.notifyEmail}
            <div>Takaka · Richmond · Blenheim · Christchurch · Collingwood</div>
          </div>
        </footer>
      ) : (
        <footer className="app-footer">
          <span>
            {user ? `${getRoleDisplayName(user.claim)} · ${user.displayName}` : brand.shortName}
          </span>
          <span className="muted">Showcase · location layer only</span>
        </footer>
      )}
    </div>
  );
}
