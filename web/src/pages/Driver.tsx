import { FormEvent, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shell } from "../Shell";
import { currentUser } from "../session";
import { connector, flushPendingScans } from "../shared/connectors";
import { loadState, subscribe } from "../shared/store";
import { ROUTE_POINTS } from "../shared/seeds";
import { MapPins } from "../MapPins";

type Phase = "idle" | "camera" | "done";

export function DriverPage() {
  const user = currentUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [showManual, setShowManual] = useState(false);
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

  async function startCamera() {
    setStatus("");
    setPhase("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const Detector = window.BarcodeDetector;
      if (!Detector) {
        setShowManual(true);
        setStatus("Type the code — this browser can’t read barcodes.");
        return;
      }
      const detector = new Detector({ formats: ["code_128", "qr_code", "ean_13", "code_39"] });
      const loop = async () => {
        if (!streamRef.current || !videoRef.current) return;
        if (videoRef.current.readyState >= 2) {
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              setCode(codes[0].rawValue.toUpperCase());
              stopCamera();
              setPhase("idle");
              setStatus("Code read — tap Tag location");
              return;
            }
          } catch {
            /* keep scanning */
          }
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch {
      setPhase("idle");
      setShowManual(true);
      setStatus("Camera blocked — type the code instead.");
    }
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
  }

  return (
    <Shell noindex variant="app">
      {!online ? (
        <div className="banner">Offline — tags save on this phone until signal returns.</div>
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
              <button className="btn btn-ink btn-block" type="button" onClick={() => void startCamera()}>
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

        <div className="driver-map">
          <h2>Your trail</h2>
          <MapPins scans={mine} height={240} />
        </div>
      </section>
    </Shell>
  );
}
