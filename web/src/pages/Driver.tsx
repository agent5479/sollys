import { FormEvent, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shell } from "../Shell";
import { currentUser } from "../session";
import { connector, flushPendingScans } from "../shared/connectors";
import { loadState, subscribe } from "../shared/store";
import { ROUTE_POINTS } from "../shared/seeds";
import { MapPins } from "../MapPins";

export function DriverPage() {
  const user = currentUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState("SL-4821");
  const [status, setStatus] = useState("");
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [tick, setTick] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    const on = () => {
      setOnline(true);
      const n = flushPendingScans();
      if (n) setStatus(`Synced ${n} queued scan(s).`);
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!user || user.claim !== "trainer") return <Navigate to="/app/signin" replace />;

  const driverId = user.id;
  const state = loadState();
  const mine = state.scans.filter((s) => s.driverId === driverId);
  void tick;

  async function coords(simulate: boolean): Promise<{ lat: number; lng: number }> {
    if (simulate) {
      const i = mine.length % ROUTE_POINTS.length;
      return ROUTE_POINTS[i];
    }
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("No geolocation — use Simulate GPS."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error("GPS denied — use Simulate GPS.")),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  }

  async function record(simulate: boolean) {
    setStatus("");
    try {
      const geo = await coords(simulate);
      const scan = await connector.scanConsignment({
        code,
        driverId,
        lat: geo.lat,
        lng: geo.lng,
      });
      setStatus(
        scan.pending
          ? `Queued ${scan.labelCode} offline.`
          : `Tagged ${scan.labelCode} at ${scan.lat.toFixed(4)}, ${scan.lng.toFixed(4)}.`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Scan failed");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await record(false);
  }

  async function startCamera() {
    setStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const Detector = window.BarcodeDetector;
      if (!Detector) {
        setStatus("This browser cannot decode barcodes. Type the code instead.");
        return;
      }
      const detector = new Detector({ formats: ["code_128", "qr_code", "ean_13", "code_39"] });
      const tickDetect = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          requestAnimationFrame(tickDetect);
          return;
        }
        const codes = await detector.detect(videoRef.current);
        if (codes[0]?.rawValue) {
          setCode(codes[0].rawValue);
          stopCamera();
          setStatus(`Read ${codes[0].rawValue}. Confirm GPS to save.`);
          return;
        }
        requestAnimationFrame(tickDetect);
      };
      requestAnimationFrame(tickDetect);
    } catch {
      setStatus("Camera unavailable. Type the consignment code.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  return (
    <Shell noindex>
      {!online ? (
        <div className="banner">
          Offline — scans save on this phone and sync when signal returns.
        </div>
      ) : null}
      <section className="section">
        <div className="wrap">
          <p className="kicker">Driver</p>
          <h1 className="display">Scan and tag GPS</h1>
          <p className="muted">Kia ora {user.displayName}. Takaka run. Camera optional — typed codes always work.</p>
          <div className="grid-2" style={{ marginTop: "1rem" }}>
            <form className="card" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="scan-code">Consignment code</label>
                <input id="scan-code" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <video ref={videoRef} className="video-scan" muted playsInline />
              <div className="hero-actions" style={{ marginTop: "0.75rem" }}>
                <button className="btn btn-line" type="button" onClick={startCamera}>
                  Scan label
                </button>
                <button className="btn btn-ink" type="submit">
                  Tag live GPS
                </button>
                <button className="btn btn-primary" type="button" onClick={() => record(true)}>
                  Simulate GPS
                </button>
              </div>
              {status ? <p>{status}</p> : null}
            </form>
            <div>
              <MapPins scans={mine} />
              <p className="muted">{mine.length} scan(s) on this handset.</p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
