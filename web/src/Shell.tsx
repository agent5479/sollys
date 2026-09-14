import { NavLink, Link } from "react-router-dom";
import { brand } from "./shared/labels";
import { currentUser, signOut } from "./session";
import type { ReactNode } from "react";

export function Shell({
  children,
  noindex,
}: {
  children: ReactNode;
  noindex?: boolean;
}) {
  const user = currentUser();
  return (
    <>
      {noindex ? <meta name="robots" content="noindex,follow" /> : null}
      <header className="site-header">
        <Link className="brand-mark" to="/">
          <img src="/brand/logo-light.svg" alt="" />
          <strong>{brand.shortName}</strong>
        </Link>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/track">Track</NavLink>
          <NavLink to="/app/signin">Sign in</NavLink>
          {user?.claim === "trainer" ? <NavLink to="/app/driver">Driver</NavLink> : null}
          {user?.claim === "admin" ? <NavLink to="/app/ops">Ops</NavLink> : null}
          {user?.claim === "member" ? <NavLink to="/app/client">Client</NavLink> : null}
          {user ? (
            <button
              className="btn btn-line"
              type="button"
              onClick={() => {
                signOut();
                window.location.assign("/");
              }}
            >
              Sign out
            </button>
          ) : null}
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <div className="wrap">
          {brand.copyrightText} · {brand.phone} · {brand.notifyEmail}
          <div>Takaka · Richmond · Blenheim · Christchurch · Collingwood</div>
        </div>
      </footer>
    </>
  );
}
