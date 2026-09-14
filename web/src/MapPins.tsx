import type { Scan } from "./shared/types";
import { depots } from "./shared/seeds";

const BOX = { minLat: -44.2, maxLat: -40.4, minLng: 172.3, maxLng: 174.4 };

function xy(lat: number, lng: number): { x: string; y: string } {
  const x = ((lng - BOX.minLng) / (BOX.maxLng - BOX.minLng)) * 100;
  const y = ((BOX.maxLat - lat) / (BOX.maxLat - BOX.minLat)) * 100;
  return { x: `${Math.min(96, Math.max(4, x))}%`, y: `${Math.min(96, Math.max(4, y))}%` };
}

export function MapPins({ scans, showDepots = true }: { scans: Scan[]; showDepots?: boolean }) {
  const lastId = scans[scans.length - 1]?.id;
  return (
    <div className="map" role="img" aria-label="South Island corridor map">
      {showDepots
        ? depots
            .filter((d) => ["takaka", "richmond", "blenheim", "christchurch"].includes(d.id))
            .map((d) => {
              const p = xy(d.lat, d.lng);
              return (
                <span key={d.id} className="map-label" style={{ left: p.x, top: p.y }}>
                  {d.name.replace(" Depot", "").replace(" Head Office", "")}
                </span>
              );
            })
        : null}
      {scans.map((s) => {
        const p = xy(s.lat, s.lng);
        return (
          <span
            key={s.id}
            className={s.id === lastId ? "map-pin last" : "map-pin"}
            style={{ left: p.x, top: p.y }}
            title={`${s.labelCode} ${new Date(s.at).toLocaleString("en-NZ")}`}
          />
        );
      })}
    </div>
  );
}
