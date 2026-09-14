import { normalizeScanPayload } from "./shared/scanPayload";

const DETECTOR_FORMATS = ["code_128", "qr_code", "ean_13", "code_39"] as const;

type StopFn = () => void;

/** Continuous decode from a live video element. Returns a stop function. */
export async function startCodeScan(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
): Promise<StopFn> {
  let stopped = false;
  let raf = 0;
  let handled = false;
  const Detector = window.BarcodeDetector;

  if (Detector) {
    const detector = new Detector({ formats: [...DETECTOR_FORMATS] });
    const loop = async () => {
      if (stopped || !video.isConnected) return;
      if (video.readyState >= 2) {
        try {
          const codes = await detector.detect(video);
          const raw = codes[0]?.rawValue;
          if (raw) {
            const code = normalizeScanPayload(raw);
            if (code) {
              onCode(code);
              return;
            }
          }
        } catch {
          /* keep scanning */
        }
      }
      raf = requestAnimationFrame(() => {
        void loop();
      });
    };
    raf = requestAnimationFrame(() => {
      void loop();
    });
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }

  const { BrowserMultiFormatReader } = await import("@zxing/browser");
  if (stopped) return () => undefined;

  const reader = new BrowserMultiFormatReader();
  const controlsPromise = reader.decodeFromVideoElement(video, (result) => {
    if (stopped || handled || !result) return;
    const code = normalizeScanPayload(result.getText());
    if (!code) return;
    handled = true;
    onCode(code);
  });

  return () => {
    stopped = true;
    void controlsPromise.then((controls) => controls?.stop());
  };
}
