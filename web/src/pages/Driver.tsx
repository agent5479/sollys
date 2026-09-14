import { FormEvent, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shell } from "../Shell";
import { currentUser } from "../session";
import { connector, flushPendingScans } from "../shared/connectors";
import { loadState, subscribe } from "../shared/store";
import { ROUTE_POINTS } from "../shared/seeds";
import { DEMO_LABEL_CODES } from "../shared/scanPayload";
import { MapPins } from "../MapPins";
import { DemoQr } from "../DemoQr";
import { startCodeScan } from "../scanLoop";

type Phase = "idle" | "camera" | "done";
type CamPrompt = "none" | "ask" | "denied";

export function DriverPage() {
  const user = currentUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showDemoLabel, setShowDemoLabel] = useState(false);
  const [demoLabel, setDemoLabel] = useState<string>(DEMO_LABEL_CODES[0]);
  const [camPrompt, setCamPrompt] = useState<CamPrompt>("none");
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [tick, setTick] = useState(0);

  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    const on = () => {
      setOnline(true);
      const n = flushPendingScans();
      if (n) setStatus(`Synced ${n} queued scan${n === 1 ? "" : "s"}`);
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      stopCamera();
    };
  }, []);

  if (!user || user.claim !== "trainer") return <Navigate to="/app/signin" replace />;

  const driverId = user.id;
  const state = loadState();
  const mine = state.scans.filter((s) => s.driverId === driverId);
  const last = mine[mine.length - 1];
  void tick;

  function stopCamera() {
    stopScanRef.current?.();
    stopScanRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function coords(simulate: boolean): Promise<{ lat: number; lng: number }> {
    if (simulate) {
      const i = mine.length % ROUTE_POINTS.length;
      return ROUTE_POINTS[i];
    }
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS unavailable — use demo location."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error("GPS denied — use demo location.")),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  }

  async function tag(simulate: boolean) {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setStatus("Enter or scan a code first.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const geo = await coords(simulate);
      const scan = await connector.scanConsignment({
        code: trimmed,
        driverId,
        lat: geo.lat,
        lng: geo.lng,
      });
      stopCamera();
      setPhase("done");
      setStatus(
        scan.pending
          ? `${scan.labelCode} saved offline`
          : `${scan.labelCode} tagged`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not tag");
    } finally {
      setBusy(false);
    }
  }

  function requestCamera() {
    setStatus("");
    setCamPrompt("ask");
  }

  async function allowCamera() {
    setCamPrompt("none");
    setStatus("");
    setPhase("camera");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("unsupported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        stopScanRef.current = await startCodeScan(video, (scanned) => {
          setCode(scanned);
          stopCamera();
          setPhase("idle");
          setStatus("Code read — tap Tag location");
        });
      }
    } catch {
      stopCamera();
      setPhase("idle");
      setShowManual(true);
      setCamPrompt("denied");
    }
  }

  function dismissCamPrompt() {
    setCamPrompt("none");
    setShowManual(true);
    setStatus("Type the code instead.");
  }

  function onManual(e: FormEvent) {
    e.preventDefault();
    void tag(false);
  }

  function resetScan() {
    stopCamera();
    setCode("");
    setPhase("idle");
    setStatus("");
    setShowManual(false);
    setCamPrompt("none");
  }

  return (
    <Shell noindex variant="app">
      {!online ? (
        <div className="banner">Offline — tags save on this phone until signal returns.</div>
      ) : null}

      {camPrompt !== "none" ? (
        <div className="perm-sheet" role="dialog" aria-modal="true" aria-labelledby="cam-perm-title">
          <div className="perm-sheet-card">
            {camPrompt === "ask" ? (
              <>
                <p className="kicker">Camera access</p>
                <h2 id="cam-perm-title">Allow camera to scan labels</h2>
                <p>
                  Sollys needs the camera to read the consignment code on the label, then you tag
                  GPS from this phone.
                </p>
                <p className="perm-caveat">
                  Showcase — in a native app this would be the OS permission prompt. On the web,
                  your browser asks next.
                </p>
                <div className="perm-actions">
                  <button className="btn btn-ink btn-block" type="button" onClick={() => void allowCamera()}>
                    Allow camera
                  </button>
                  <button className="btn btn-line btn-block" type="button" onClick={dismissCamPrompt}>
                    Type code instead
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="kicker">Camera blocked</p>
                <h2 id="cam-perm-title">Turn on camera for this site</h2>
                <p>
                  The browser blocked the camera. Open site settings (lock icon in the address bar),
                  allow Camera, then try again. Use HTTPS or localhost for a live demo.
                </p>
                <p className="perm-caveat">
                  Showcase — a shipped app would deep-link into system Settings for this permission.
                </p>
                <div className="perm-actions">
                  <button className="btn btn-ink btn-block" type="button" onClick={() => void allowCamera()}>
                    Try camera again
                  </button>
                  <button className="btn btn-line btn-block" type="button" onClick={dismissCamPrompt}>
                    Type code instead
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <section className="driver-screen">
        <header className="driver-top">
          <div>
            <p className="kicker">Driver</p>
            <h1>{user.displayName.split(" ")[0]}</h1>
            <p className="muted" style={{ margin: "0.35rem 0 0", maxWidth: "28ch" }}>
              Scan the label, then tag location so customers can track it.
            </p>
          </div>
          <div className="driver-stat">
            <strong>{mine.length}</strong>
            <span>today</span>
          </div>
        </header>

        <div className={`scanner ${phase === "camera" ? "is-live" : ""} ${phase === "done" ? "is-done" : ""}`}>
          <video ref={videoRef} className="scanner-video" muted playsInline />
          {phase !== "camera" ? (
            <div className="scanner-idle">
              {phase === "done" && last ? (
                <>
                  <div className="scanner-check" aria-hidden>
                    ✓
                  </div>
                  <p className="scanner-code">{last.labelCode}</p>
                  <p className="muted">Location tagged</p>
                </>
              ) : (
                <>
                  <div className="scanner-glyph" aria-hidden>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <p>Point at the label</p>
                </>
              )}
            </div>
          ) : null}
          <div className="scanner-frame" aria-hidden>
            <i />
            <i />
            <i />
            <i />
            {phase === "camera" ? <div className="scanner-beam" /> : null}
          </div>
          {code ? <div className="scanner-chip">{code}</div> : null}
        </div>

        {status ? <p className={`driver-status ${phase === "done" ? "ok" : ""}`}>{status}</p> : null}

        <div className="driver-actions">
          {phase === "done" ? (
            <button className="btn btn-ink btn-block" type="button" onClick={resetScan}>
              Scan next
            </button>
          ) : phase === "camera" ? (
            <>
              <button
                className="btn btn-primary btn-block"
                type="button"
                disabled={busy || !code}
                onClick={() => void tag(false)}
              >
                {busy ? "Tagging…" : "Tag location"}
              </button>
              <button
                className="btn btn-line btn-block"
                type="button"
                onClick={() => {
                  stopCamera();
                  setPhase("idle");
                }}
              >
                Cancel camera
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ink btn-block" type="button" onClick={requestCamera}>
                Open camera
              </button>
              <button
                className="btn btn-primary btn-block"
                type="button"
                disabled={busy || !code.trim()}
                onClick={() => void tag(false)}
              >
                {busy ? "Tagging…" : "Tag location"}
              </button>
            </>
          )}
        </div>

        <div className="driver-secondary">
          <button
            type="button"
            className="linkish"
            onClick={() => setShowManual((v) => !v)}
          >
            {showManual ? "Hide code entry" : "Type code instead"}
          </button>
          <button
            type="button"
            className="linkish"
            disabled={busy || !code.trim()}
            onClick={() => void tag(true)}
          >
            Use demo GPS
          </button>
        </div>

        {showManual ? (
          <form className="driver-manual" onSubmit={onManual}>
            <label htmlFor="scan-code">Consignment code</label>
            <input
              id="scan-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SL-4821"
              autoComplete="off"
              inputMode="text"
            />
          </form>
        ) : null}

        <div className="demo-label-panel">
          <button
            type="button"
            className="linkish"
            onClick={() => setShowDemoLabel((v) => !v)}
          >
            {showDemoLabel ? "Hide demo label" : "Show demo label QR"}
          </button>
          {showDemoLabel ? (
            <div className="demo-label-body">
              <div className="try-chips">
                {DEMO_LABEL_CODES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${demoLabel === c ? "is-active" : ""}`}
                    onClick={() => setDemoLabel(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <DemoQr
                value={demoLabel}
                label="Demo freight label"
                caveat="Showcase stand-in for a printed label — scan with another phone, or print this QR."
              />
            </div>
          ) : null}
        </div>

        <div className="driver-map">
          <h2>Your trail</h2>
          <MapPins scans={mine} height={240} />
        </div>
      </section>
    </Shell>
  );
}
