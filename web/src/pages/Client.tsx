import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shell } from "../Shell";
import { currentUser } from "../session";
import { connector } from "../shared/connectors";
import { loadState, subscribe } from "../shared/store";
import { commuteMinutes, formatDuration } from "../shared/commute";
import { useEffect } from "react";

export function ClientPage() {
  const user = currentUser();
  const [truckId, setTruckId] = useState("gb-07");
  const [weightKg, setWeightKg] = useState(350);
  const [cubeM3, setCubeM3] = useState(1);
  const [notes, setNotes] = useState("Pallet of bagged feed");
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);

  if (!user || user.claim !== "member") return <Navigate to="/app/signin" replace />;

  const state = loadState();
  void tick;
  const mine = state.bookings.filter((b) => b.clientId === user.id);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const b = await connector.reserveCapacity({
        truckId,
        clientId: user!.id,
        weightKg,
        cubeM3,
        notes,
      });
      setMsg(`Booking ${b.id} held on the run.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not reserve space");
    }
  }

  return (
    <Shell noindex>
      <section className="section">
        <div className="wrap">
          <p className="kicker">Client</p>
          <h1 className="display">Reserve leftover space</h1>
          <p className="muted">
            {user.displayName} — leftover cube on seeded runs, not a full freight quote.
          </p>
          <div className="grid-2" style={{ marginTop: "1rem" }}>
            <form className="card" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="run">Run</label>
                <select id="run" value={truckId} onChange={(e) => setTruckId(e.target.value)}>
                  {state.trucks.map((t) => {
                    const from = state.depots.find((d) => d.id === t.fromDepotId);
                    const to = state.depots.find((d) => d.id === t.toDepotId);
                    const mins = from && to ? commuteMinutes(from, to) : 0;
                    const leftKg = t.capacityKg - t.usedKg;
                    const leftM3 = t.capacityM3 - t.usedM3;
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.run} · leftover {leftKg} kg / {leftM3.toFixed(1)} m³ ·{" "}
                        {formatDuration(mins)}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="field">
                <label htmlFor="w">Weight (kg)</label>
                <input
                  id="w"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="c">Cube (m³)</label>
                <input
                  id="c"
                  type="number"
                  step="0.1"
                  value={cubeM3}
                  onChange={(e) => setCubeM3(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="n">Notes</label>
                <textarea id="n" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <button className="btn btn-ink" type="submit">
                Book leftover space
              </button>
              {msg ? <p>{msg}</p> : null}
            </form>
            <div className="card">
              <h3>Your bookings</h3>
              {mine.length === 0 ? (
                <p className="muted">None yet.</p>
              ) : (
                <ul>
                  {mine.map((b) => {
                    const t = state.trucks.find((x) => x.id === b.truckId);
                    return (
                      <li key={b.id}>
                        {t?.name} {t?.run} — {b.weightKg} kg / {b.cubeM3} m³
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
