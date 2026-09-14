import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  value: string;
  label: string;
  caveat: string;
  size?: number;
};

export function DemoQr({ value, label, caveat, size = 168 }: Props) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    void QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: size,
      color: { dark: "#1c3d1a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then((out) => {
      if (!cancelled) setSvg(out);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <figure className="demo-qr">
      <div
        className="demo-qr-frame"
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
        aria-hidden={!svg}
      />
      <figcaption>
        <strong>{label}</strong>
        <span className="demo-qr-value">{value}</span>
        <span className="muted demo-qr-caveat">{caveat}</span>
      </figcaption>
    </figure>
  );
}
