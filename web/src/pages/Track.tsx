import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Shell } from "../Shell";
import { MapPins } from "../MapPins";
import { connector } from "../shared/connectors";
import type { TrackingView } from "../shared/types";
import { loadState } from "../shared/store";

export function TrackPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("code") ?? "SL-4821";
  const [code, setCode] = useState(initial);
  const [view, setView] = useState<TrackingView | null>(null);
  const [error, setError] = useState("");
  const [looked, setLooked] = useState(false);

  const depotName = useMemo(() => {
    const depots = loadState().depots;
    return (id: string) => depots.find((d) => d.id === id)?.name ?? id;
  }, []);

  async function lookup(nextCode: string) {
    setError("");
    setLooked(true);
    const result = await connector.getTracking(nextCode);
    if (!result) {
      setView(null);
      setError("No consignment matches that code.");
      return;
    }
    setView(result);
    setParams({ code: result.consignment.trackingCode });
  }

  useEffect(() => {
    if (params.get("code")) {
      void lookup(params.get("code")!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await lookup(code);
  }

  return (
    <Shell variant="marketing">
      <section className="section">
        <div className="wrap track-wrap">
          <p className="kicker">Customer lookup</p>
          <h1 className="display">Where is my freight?</h1>
          <p className="muted">Enter the label code. No login required.</p>
          <div className="try-chips">
            <button type="button" className="chip" onClick={() => { setCode("SL-4821"); void lookup("SL-4821"); }}>
              Try SL-4821
            </button>
            <button type="button" className="chip" onClick={() => { setCode("SL-4823"); void lookup("SL-4823"); }}>
              Try SL-4823
            </button>
          </div>
          <form className="card track-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="code">Tracking code</label>
              <input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoComplete="off"
                placeholder="SL-4821"
              />
            </div>
            <button className="btn btn-ink" type="submit">
              Look up
            </button>
            {error ? <p className="track-error">{error}</p> : null}
            {looked && !error && !view ? (
              <p className="muted">Nothing found for that code.</p>
            ) : null}
          </form>
          {view ? (
            <div className="grid-2 track-result">
              <div className="card">
                <span className={`pill ${view.consignment.status}`}>
                  {view.consignment.status.replace("_", " ")}
                </span>
                <h2>{view.consignment.trackingCode}</h2>
                <p>{view.consignment.description}</p>
                <p className="muted">
                  {depotName(view.consignment.originDepotId)} →{" "}
                  {depotName(view.consignment.destDepotId)}
                </p>
                {view.last ? (
                  <p>
                    Last seen {new Date(view.last.at).toLocaleString("en-NZ")} at{" "}
                    {view.last.lat.toFixed(4)}, {view.last.lng.toFixed(4)}
                  </p>
                ) : (
                  <p className="muted">No location tags yet.</p>
                )}
              </div>
              <div>
                <MapPins
                  scans={view.scans}
                  layers={{ depots: true, consignments: true, vehicles: false }}
                  height={300}
                />
                {view.scans.length ? (
                  <ul className="scan-list">
                    {[...view.scans].reverse().map((s) => (
                      <li key={s.id}>
                        {new Date(s.at).toLocaleString("en-NZ")} — {s.note ?? s.labelCode}
                        {s.pending ? " (queued)" : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}
