import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shell } from "../Shell";
import { MapPins } from "../MapPins";
import { currentUser } from "../session";
import { loadState, resetState, subscribe } from "../shared/store";
import { commuteMinutes, formatDuration } from "../shared/commute";

type Tab = "lookup" | "map" | "fleet" | "calc" | "outbox";

export function OpsPage() {
  const user = currentUser();
  const [tab, setTab] = useState<Tab>("lookup");
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);
  const [truckId, setTruckId] = useState("tk-12");
  const [addKg, setAddKg] = useState(400);
  const [addM3, setAddM3] = useState(1.2);

  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);

  if (!user || user.claim !== "admin") return <Navigate to="/app/signin" replace />;

  const state = loadState();
  void tick;
  const filtered = state.consignments.filter(
    (c) =>
      !q ||
      c.trackingCode.toLowerCase().includes(q.toLowerCase()) ||
      c.description.toLowerCase().includes(q.toLowerCase()),
  );
  const depot = (id: string) => state.depots.find((d) => d.id === id);
  const truck = state.trucks.find((t) => t.id === truckId) ?? state.trucks[0];
  const remainKg = truck.capacityKg - truck.usedKg;
  const remainM3 = truck.capacityM3 - truck.usedM3;
  const booked = state.bookings.filter((b) => b.truckId === truck.id);
  const fromDepot = depot(truck.fromDepotId);
  const toDepot = depot(truck.toDepotId);
  const travel = fromDepot && toDepot ? commuteMinutes(fromDepot, toDepot) : 0;

  function leftoverAfterDemo(): { kg: number; m3: number } {
    return {
      kg: remainKg - addKg,
      m3: Number((remainM3 - addM3).toFixed(1)),
    };
  }

  return (
    <Shell noindex>
      <section className="section">
        <div className="wrap">
          <p className="kicker">Admin</p>
          <h1 className="display">Operations</h1>
          <p className="muted">Simulated drivers and consignments. Reset showcase to restore seed data.</p>
          <p>
            <button className="btn btn-line" type="button" onClick={() => resetState()}>
              Reset demo data
            </button>
          </p>
          <div className="tabs" role="tablist">
            {(
              [
                ["lookup", "Consignments"],
                ["map", "Map"],
                ["fleet", "Fleet"],
                ["calc", "Calculator"],
                ["outbox", "Outbox"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "lookup" ? (
            <div className="card">
              <div className="field">
                <label htmlFor="q">Find consignment</label>
                <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="SL-4821" />
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
                      <tr key={c.id}>
                        <td>{c.trackingCode}</td>
                        <td>
                          <span className={`pill ${c.status}`}>{c.status.replace("_", " ")}</span>
                        </td>
                        <td>
                          {depot(c.originDepotId)?.name} → {depot(c.destDepotId)?.name}
                        </td>
                        <td>
                          {last
                            ? `${last.lat.toFixed(3)}, ${last.lng.toFixed(3)}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === "map" ? (
            <div>
              <MapPins scans={state.scans} />
              <p className="muted">Pins are driver scans. Simulated driver: Tane Riwaka on the Takaka run.</p>
            </div>
          ) : null}

          {tab === "fleet" ? (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Truck</th>
                    <th>Run</th>
                    <th>Road time</th>
                    <th>Leftover kg</th>
                    <th>Leftover m³</th>
                    <th>Depart</th>
                  </tr>
                </thead>
                <tbody>
                  {state.trucks.map((t) => {
                    const from = depot(t.fromDepotId);
                    const to = depot(t.toDepotId);
                    const mins =
                      from && to ? commuteMinutes(from, to) : 0;
                    return (
                      <tr key={t.id}>
                        <td>{t.name}</td>
                        <td>{t.run}</td>
                        <td>{formatDuration(mins)}</td>
                        <td>{t.capacityKg - t.usedKg}</td>
                        <td>{(t.capacityM3 - t.usedM3).toFixed(1)}</td>
                        <td>{t.departLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === "calc" ? (
            <div className="card">
              <p className="muted">Demo arithmetic — not a load optimiser.</p>
              <div className="field">
                <label htmlFor="truck">Truck</label>
                <select id="truck" value={truck.id} onChange={(e) => setTruckId(e.target.value)}>
                  {state.trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {t.run}
                    </option>
                  ))}
                </select>
              </div>
              <p>
                Road time {formatDuration(travel)}. Capacity {truck.capacityKg} kg / {truck.capacityM3} m³.
                Used {truck.usedKg} kg / {truck.usedM3} m³. Leftover {remainKg} kg / {remainM3.toFixed(1)} m³.
              </p>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="kg">Add kg (what-if)</label>
                  <input
                    id="kg"
                    type="number"
                    value={addKg}
                    onChange={(e) => setAddKg(Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="m3">Add m³ (what-if)</label>
                  <input
                    id="m3"
                    type="number"
                    step="0.1"
                    value={addM3}
                    onChange={(e) => setAddM3(Number(e.target.value))}
                  />
                </div>
              </div>
              <p>
                After that load: {leftoverAfterDemo().kg} kg / {leftoverAfterDemo().m3} m³ remaining.
                {leftoverAfterDemo().kg < 0 || leftoverAfterDemo().m3 < 0
                  ? " Over capacity."
                  : " Fits this run."}
              </p>
              <h3>Bookings on this truck</h3>
              {booked.length === 0 ? (
                <p className="muted">No leftover-space bookings on this truck yet.</p>
              ) : (
                <ul>
                  {booked.map((b) => (
                    <li key={b.id}>
                      {b.weightKg} kg / {b.cubeM3} m³ · {b.notes || "no note"} ·{" "}
                      {new Date(b.at).toLocaleString("en-NZ")}
                    </li>
                  ))}
                </ul>
              )}
              <h3>All leftover bookings</h3>
              {state.bookings.length === 0 ? (
                <p className="muted">None in the showcase store.</p>
              ) : (
                <ul>
                  {state.bookings.map((b) => {
                    const t = state.trucks.find((x) => x.id === b.truckId);
                    return (
                      <li key={b.id}>
                        {t?.name} — {b.weightKg} kg / {b.cubeM3} m³ · {b.notes || "no note"}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}

          {tab === "outbox" ? (
            <div className="card">
              <p className="muted">Stub only — nothing leaves this browser.</p>
              <ul>
                {state.outbox.map((m) => (
                  <li key={m.id}>
                    <strong>{m.subject}</strong> → {m.to}
                    <div className="muted">
                      {new Date(m.at).toLocaleString("en-NZ")} — {m.body}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}
