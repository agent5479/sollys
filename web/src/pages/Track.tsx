import { FormEvent, useMemo, useState } from "react";
import { Shell } from "../Shell";
import { MapPins } from "../MapPins";
import { connector } from "../shared/connectors";
import type { TrackingView } from "../shared/types";
import { loadState } from "../shared/store";

export function TrackPage() {
  const [code, setCode] = useState("SL-4821");
  const [view, setView] = useState<TrackingView | null>(null);
  const [error, setError] = useState("");

  const depotName = useMemo(() => {
    const depots = loadState().depots;
    return (id: string) => depots.find((d) => d.id === id)?.name ?? id;
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const result = await connector.getTracking(code);
    if (!result) {
      setView(null);
      setError("No consignment matches that code in the showcase store.");
      return;
    }
    setView(result);
  }

  return (
    <Shell>
      <section className="section">
        <div className="wrap">
          <p className="kicker">Public lookup</p>
          <h1 className="display">Track a consignment</h1>
          <p className="muted">Enter the label code. Try SL-4821.</p>
          <form className="card" onSubmit={onSubmit} style={{ maxWidth: 480, marginTop: "1rem" }}>
            <div className="field">
              <label htmlFor="code">Tracking code</label>
              <input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button className="btn btn-ink" type="submit">
              Look up
            </button>
            {error ? <p className="muted">{error}</p> : null}
          </form>
          {view ? (
            <div className="grid-2" style={{ marginTop: "1.5rem" }}>
              <div className="card">
                <span className={`pill ${view.consignment.status}`}>{view.consignment.status.replace("_", " ")}</span>
                <h2>{view.consignment.trackingCode}</h2>
                <p>{view.consignment.description}</p>
                <p className="muted">
                  {depotName(view.consignment.originDepotId)} → {depotName(view.consignment.destDepotId)}
                </p>
                {view.last ? (
                  <p>
                    Last seen {new Date(view.last.at).toLocaleString("en-NZ")} at {view.last.lat.toFixed(4)},{" "}
                    {view.last.lng.toFixed(4)}
                  </p>
                ) : (
                  <p className="muted">No scans yet.</p>
                )}
              </div>
              <div>
                <MapPins scans={view.scans} height={300} />
                <ul>
                  {[...view.scans].reverse().map((s) => (
                    <li key={s.id}>
                      {new Date(s.at).toLocaleString("en-NZ")} — {s.note ?? s.labelCode}
                      {s.pending ? " (queued)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}
