import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Scan, VehiclePosition } from "./shared/types";
import { depots } from "./shared/seeds";

const CORRIDOR_DEPOTS = ["takaka", "richmond", "blenheim", "christchurch"] as const;

export type MapLayers = {
  depots?: boolean;
  consignments?: boolean;
  vehicles?: boolean;
};

type Props = {
  scans?: Scan[];
  vehicles?: VehiclePosition[];
  layers?: MapLayers;
  height?: number;
  className?: string;
  fitPadding?: number;
};

export function MapPins({
  scans = [],
  vehicles = [],
  layers = { depots: true, consignments: true, vehicles: true },
  height = 320,
  className = "",
  fitPadding = 36,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const showDepots = layers.depots !== false;
  const showCons = layers.consignments !== false;
  const showVehicles = layers.vehicles !== false;

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
    const group = layerRef.current;
    if (!map || !group) return;

    group.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    if (showDepots) {
      for (const id of CORRIDOR_DEPOTS) {
        const d = depots.find((x) => x.id === id);
        if (!d) continue;
        const pt: L.LatLngExpression = [d.lat, d.lng];
        bounds.push(pt);
        const short = d.name.replace(" Depot", "").replace(" Head Office", "");
        L.circleMarker(pt, {
          radius: 6,
          color: "#1C3D1A",
          weight: 2,
          fillColor: "#fff",
          fillOpacity: 1,
        })
          .bindTooltip(short, {
            permanent: true,
            direction: "top",
            offset: [0, -8],
            className: "map-depot-tip",
          })
          .addTo(group);
      }
    }

    if (showCons && scans.length) {
      const path = scans.map((s) => [s.lat, s.lng] as L.LatLngExpression);
      if (path.length > 1) {
        L.polyline(path, {
          color: "#1C3D1A",
          weight: 3,
          opacity: 0.5,
          dashArray: "6 8",
        }).addTo(group);
      }
      scans.forEach((s, i) => {
        const isLast = i === scans.length - 1;
        const pt: L.LatLngExpression = [s.lat, s.lng];
        bounds.push(pt);
        L.circleMarker(pt, {
          radius: isLast ? 9 : 5,
          color: "#1C3D1A",
          weight: isLast ? 3 : 2,
          fillColor: isLast ? "#C5D44A" : "#D4B20A",
          fillOpacity: 1,
        })
          .bindPopup(
            `<strong>${s.labelCode}</strong><br/>${new Date(s.at).toLocaleString("en-NZ")}${
              s.note ? `<br/>${s.note}` : ""
            }`,
          )
          .addTo(group);
      });
    }

    if (showVehicles) {
      for (const v of vehicles) {
        const pt: L.LatLngExpression = [v.lat, v.lng];
        bounds.push(pt);
        const icon = L.divIcon({
          className: "truck-marker",
          html: `<div class="truck-marker-inner" title="${v.label}">${v.label}</div>`,
          iconSize: [52, 24],
          iconAnchor: [26, 12],
        });
        L.marker(pt, { icon })
          .bindPopup(
            `<strong>${v.label}</strong><br/>Vehicle GPS (${v.source})<br/>${new Date(
              v.at,
            ).toLocaleString("en-NZ")}`,
          )
          .addTo(group);
      }
    }

    if (bounds.length) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [fitPadding, fitPadding], maxZoom: 10 });
    } else {
      map.setView([-41.8, 173.2], 7);
    }
    requestAnimationFrame(() => map.invalidateSize());
  }, [scans, vehicles, showDepots, showCons, showVehicles, fitPadding]);

  return (
    <div
      className={`map-frame ${className}`.trim()}
      style={{ height }}
      role="img"
      aria-label="South Island live location map"
    >
      <div ref={hostRef} className="map-leaflet" />
    </div>
  );
}
