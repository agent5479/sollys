import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, NavLink, useNavigate, useParams } from "react-router-dom";
import { Shell } from "../Shell";
import { MapPins } from "../MapPins";
import { currentUser } from "../session";
import { connector } from "../shared/connectors";
import { loadState, resetState, subscribe } from "../shared/store";
import type { Consignment, Scan, VehiclePosition } from "../shared/types";
import { vehicleGpsAdapter } from "../shared/vehicleGps";

type Section = "map" | "consignments" | "fleet";

function sectionFromParam(raw?: string): Section {
  if (raw === "consignments" || raw === "fleet") return raw;
  return "map";
}

export function OpsPage() {
  const user = currentUser();
  const { section: sectionParam } = useParams();
  const section = sectionFromParam(sectionParam);
  const nav = useNavigate();
  const [tick, setTick] = useState(0);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("c-4821");
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [layers, setLayers] = useState({ depots: true, consignments: true, vehicles: true });
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);

  useEffect(() => {
    let alive = true;
    const pull = () => {
      void connector.listVehiclePositions().then((list) => {
        if (alive) setVehicles(list);
      });
    };
    pull();
    const id = window.setInterval(pull, 8000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const state = loadState();
  void tick;

  const selected = state.consignments.find((c) => c.id === selectedId) ?? null;
  const selectedScans = useMemo(() => {
    if (!selected) return [] as Scan[];
    return state.scans
      .filter((s) => s.consignmentId === selected.id)
      .sort((a, b) => a.at.localeCompare(b.at));
  }, [selected, state.scans, tick]);

  if (!user || user.claim !== "admin") return <Navigate to="/app/signin" replace />;

  const depot = (id: string) => state.depots.find((d) => d.id === id);
  const truck = (id?: string) => state.trucks.find((t) => t.id === id);

  const inTransit = state.consignments.filter((c) => c.status === "in_transit").length;
  const atDepot = state.consignments.filter((c) => c.status === "at_depot").length;

  const filtered = state.consignments.filter(
    (c) =>
      !q ||
      c.trackingCode.toLowerCase().includes(q.toLowerCase()) ||
      c.description.toLowerCase().includes(q.toLowerCase()) ||
      (c.externalRef ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  const recentScans = [...state.scans].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);

  return (
    <Shell noindex variant="app">
      <section className="ops-screen">
        <div className="ops-top">
          <div>
            <p className="kicker">Operations</p>
            <h1 className="display">Live location</h1>
            <p className="muted">
              Consignment scans and vehicle GPS — not a replacement for your depot system.
            </p>
          </div>
          <div className="ops-metrics">
            <div>
              <strong>{inTransit}</strong>
              <span>In transit</span>
            </div>
            <div>
              <strong>{atDepot}</strong>
              <span>At depot</span>
            </div>
            <div>
              <strong>{vehicles.length}</strong>
              <span>Trucks on feed</span>
            </div>
          </div>
        </div>

        <div className="ops-nav tabs" role="tablist">
          <NavLink to="/app/ops" end className={({ isActive }) => (isActive ? "tab active" : "tab")}>
            Live map
          </NavLink>
          <NavLink
            to="/app/ops/consignments"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Consignments
          </NavLink>
          <NavLink
            to="/app/ops/fleet"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Fleet
          </NavLink>
        </div>

        {section === "map" ? (
          <div className="ops-map-panel">
            <div className="layer-toggles">
              {(
                [
                  ["vehicles", "Trucks"],
                  ["consignments", "Scans"],
                  ["depots", "Depots"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="layer-toggle">
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={(e) => setLayers((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
              <span className="muted layer-note">
                GPS feed: {vehicleGpsAdapter.source}
                {vehicleGpsAdapter.source === "simulated" ? " (demo)" : ""}
              </span>
            </div>
            <MapPins
              scans={layers.consignments ? recentScans : []}
              vehicles={layers.vehicles ? vehicles : []}
              layers={layers}
              height={420}
            />
          </div>
        ) : null}

        {section === "consignments" ? (
          <div className="ops-split">
            <div className="card">
              <div className="field">
                <label htmlFor="q">Find consignment</label>
                <input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="SL-4821 or JOB-77821"
                />
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Lane</th>
                    <th>Last scan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const last = [...state.scans.filter((s) => s.consignmentId === c.id)].pop();
                    return (
                      <tr
                        key={c.id}
                        className={c.id === selectedId ? "is-selected" : undefined}
                        onClick={() => setSelectedId(c.id)}
                      >
                        <td>{c.trackingCode}</td>
                        <td>
                          <span className={`pill ${c.status}`}>{c.status.replace("_", " ")}</span>
                        </td>
                        <td>
                          {depot(c.originDepotId)?.name?.replace(" Depot", "").replace(" Head Office", "")}{" "}
                          →{" "}
                          {depot(c.destDepotId)?.name?.replace(" Depot", "").replace(" Head Office", "")}
                        </td>
                        <td>
                          {last ? `${last.lat.toFixed(3)}, ${last.lng.toFixed(3)}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ConsignmentDrawer
              consignment={selected}
              scans={selectedScans}
              truckLabel={truck(selected?.truckId)?.name}
              depotName={(id) => depot(id)?.name ?? id}
              onClose={() => setSelectedId(null)}
              onTrack={(code) => nav(`/track?code=${encodeURIComponent(code)}`)}
            />
          </div>
        ) : null}

        {section === "fleet" ? (
          <div className="card">
            <p className="muted">
              Last known vehicle positions from the GPS adapter. Link your existing truck trackers
              later — same map.
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Truck</th>
                  <th>Plate</th>
                  <th>Run</th>
                  <th>Last GPS</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {state.trucks.map((t) => {
                  const pos = vehicles.find((v) => v.truckId === t.id);
                  return (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.plate ?? "—"}</td>
                      <td>{t.run}</td>
                      <td>
                        {pos
                          ? `${pos.lat.toFixed(3)}, ${pos.lng.toFixed(3)} · ${new Date(
                              pos.at,
                            ).toLocaleTimeString("en-NZ")}`
                          : "—"}
                      </td>
                      <td>{pos?.source ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="demo-menu">
          <button type="button" className="linkish" onClick={() => setDemoOpen((v) => !v)}>
            {demoOpen ? "Hide demo tools" : "Demo tools"}
          </button>
          {demoOpen ? (
            <div className="demo-menu-body">
              <button className="btn btn-line" type="button" onClick={() => resetState()}>
                Reset demo data
              </button>
              <p className="muted">
                Leftover-space booking remains on the Client role for the pitch — not the primary
                story.
              </p>
              <Link to="/app/client">Open client leftover bookings</Link>
            </div>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}

function ConsignmentDrawer({
  consignment,
  scans,
  truckLabel,
  depotName,
  onClose,
  onTrack,
}: {
  consignment: Consignment | null;
  scans: Scan[];
  truckLabel?: string;
  depotName: (id: string) => string;
  onClose: () => void;
  onTrack: (code: string) => void;
}) {
  if (!consignment) {
    return (
      <div className="card drawer-empty">
        <p className="muted">Select a consignment to see location history.</p>
      </div>
    );
  }
  const last = scans[scans.length - 1];
  return (
    <aside className="card consignment-drawer">
      <div className="drawer-head">
        <div>
          <span className={`pill ${consignment.status}`}>
            {consignment.status.replace("_", " ")}
          </span>
          <h2>{consignment.trackingCode}</h2>
        </div>
        <button type="button" className="linkish" onClick={onClose}>
          Close
        </button>
      </div>
      <p>{consignment.description}</p>
      <p className="muted">
        {depotName(consignment.originDepotId)} → {depotName(consignment.destDepotId)}
      </p>
      {truckLabel ? <p>On truck {truckLabel}</p> : null}
      {consignment.externalRef ? (
        <p className="muted">Their job ref: {consignment.externalRef}</p>
      ) : null}
      {last ? (
        <p>
          Last seen {new Date(last.at).toLocaleString("en-NZ")} at {last.lat.toFixed(4)},{" "}
          {last.lng.toFixed(4)}
        </p>
      ) : (
        <p className="muted">No scans yet.</p>
      )}
      <MapPins scans={scans} layers={{ depots: true, consignments: true, vehicles: false }} height={200} />
      <ul className="scan-list">
        {[...scans].reverse().map((s) => (
          <li key={s.id}>
            {new Date(s.at).toLocaleString("en-NZ")} — {s.note ?? s.labelCode}
          </li>
        ))}
      </ul>
      <button className="btn btn-ink" type="button" onClick={() => onTrack(consignment.trackingCode)}>
        Open customer track view
      </button>
    </aside>
  );
}
