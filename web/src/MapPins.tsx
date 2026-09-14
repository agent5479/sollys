import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Scan } from "./shared/types";
import { depots } from "./shared/seeds";

const CORRIDOR_DEPOTS = ["takaka", "richmond", "blenheim", "christchurch"] as const;

type Props = {
  scans: Scan[];
  showDepots?: boolean;
  height?: number;
  className?: string;
};

export function MapPins({ scans, showDepots = true, height = 320, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;

    const map = L.map(hostRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    const resize = () => map.invalidateSize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(resize);

    return () => {
      window.removeEventListener("resize", resize);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layerRef.current;
    if (!map || !layers) return;

    layers.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    if (showDepots) {
      for (const id of CORRIDOR_DEPOTS) {
        const d = depots.find((x) => x.id === id);
        if (!d) continue;
        const pt: L.LatLngExpression = [d.lat, d.lng];
        bounds.push(pt);
        const short = d.name.replace(" Depot", "").replace(" Head Office", "");
        L.circleMarker(pt, {
          radius: 7,
          color: "#1C3D1A",
          weight: 2,
          fillColor: "#fff",
          fillOpacity: 1,
        })
          .bindTooltip(short, { permanent: true, direction: "top", offset: [0, -8], className: "map-depot-tip" })
          .addTo(layers);
      }
    }

    const path = scans.map((s) => [s.lat, s.lng] as L.LatLngExpression);
    if (path.length > 1) {
      L.polyline(path, {
        color: "#1C3D1A",
        weight: 3,
        opacity: 0.55,
        dashArray: "6 8",
      }).addTo(layers);
    }

    scans.forEach((s, i) => {
      const isLast = i === scans.length - 1;
      const pt: L.LatLngExpression = [s.lat, s.lng];
      bounds.push(pt);
      L.circleMarker(pt, {
        radius: isLast ? 10 : 6,
        color: "#1C3D1A",
        weight: isLast ? 3 : 2,
        fillColor: isLast ? "#C5D44A" : "#D4B20A",
        fillOpacity: 1,
        className: isLast ? "map-pin-pulse" : "",
      })
        .bindPopup(
          `<strong>${s.labelCode}</strong><br/>${new Date(s.at).toLocaleString("en-NZ")}${
            s.note ? `<br/>${s.note}` : ""
          }`,
        )
        .addTo(layers);
    });

    if (bounds.length) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [36, 36], maxZoom: 10 });
    } else {
      map.setView([-41.8, 173.2], 7);
    }

    requestAnimationFrame(() => map.invalidateSize());
  }, [scans, showDepots]);

  return (
    <div
      className={`map-frame ${className}`.trim()}
      style={{ height }}
      role="img"
      aria-label="South Island corridor map"
    >
      <div ref={hostRef} className="map-leaflet" />
    </div>
  );
}
