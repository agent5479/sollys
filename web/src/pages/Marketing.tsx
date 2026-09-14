import { Link } from "react-router-dom";
import { Shell } from "../Shell";
import { brand } from "../shared/labels";

export function MarketingPage() {
  return (
    <Shell>
      <section className="hero">
        <div className="wrap">
          <p className="kicker" style={{ color: "#c5d44a" }}>
            Freight locating pitch
          </p>
          <h1>{brand.tagline}</h1>
          <p>
            Drivers scan the unique code on a consignment. The phone tags GPS from the cab. Ops
            and customers look it up — instead of a paper trail between Golden Bay and
            Christchurch.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/track">
              Track a consignment
            </Link>
            <Link className="btn btn-ghost" to="/app/signin">
              Open the app
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-3">
          <article className="card">
            <h3>Driver scan</h3>
            <p className="muted">
              Camera or typed label. GPS from the handset, or simulate a run when you are at a
              desk.
            </p>
          </article>
          <article className="card">
            <h3>Public track</h3>
            <p className="muted">Anyone with a tracking code can see the last known pin. No login.</p>
          </article>
          <article className="card">
            <h3>Leftover space</h3>
            <p className="muted">
              Clients reserve leftover cube on a seeded run. Fleet times use depot-to-depot road
              minutes.
            </p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="demo-note">
            Showcase — real-time location for consignments and trucks. Your existing freight system
            stays in charge of jobs; we add where things are. Firestore and live telematics stay
            placeholders for now. Live camera scan and demo label / track QRs are on Driver and
            Track.
          </div>
        </div>
      </section>
    </Shell>
  );
}
