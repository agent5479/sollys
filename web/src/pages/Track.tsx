import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Shell } from "../Shell";
import { MapPins } from "../MapPins";
import { DemoQr } from "../DemoQr";
import { connector } from "../shared/connectors";
import type { TrackingView } from "../shared/types";
import { loadState } from "../shared/store";
import { DEMO_LABEL_CODES, trackPageUrl } from "../shared/scanPayload";

export function TrackPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("code") ?? "SL-4821";
  const [code, setCode] = useState(initial);
  const [view, setView] = useState<TrackingView | null>(null);
  const [error, setError] = useState("");
  const [looked, setLooked] = useState(false);
  const [qrCode, setQrCode] = useState(initial);

  const depotName = useMemo(() => {
    const depots = loadState().depots;
    return (id: string) => depots.find((d) => d.id === id)?.name ?? id;
  }, []);

  const customerQrValue = useMemo(() => trackPageUrl(qrCode), [qrCode]);

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
    setQrCode(result.consignment.trackingCode);
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
            {DEMO_LABEL_CODES.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                onClick={() => {
                  setCode(c);
                  void lookup(c);
                }}
              >
                Try {c}
              </button>
            ))}
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

          <div className="demo-track-qr">
            <DemoQr
              value={customerQrValue}
              label="Customer track link"
              caveat="Showcase sticker — scan to open this tracking page on another phone."
            />
            <div className="try-chips">
              {DEMO_LABEL_CODES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${qrCode === c ? "is-active" : ""}`}
                  onClick={() => setQrCode(c)}
                >
                  QR for {c}
                </button>
              ))}
            </div>
          </div>

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
