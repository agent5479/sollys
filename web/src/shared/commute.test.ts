import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { commuteMinutes, haversineKm, TRANSITION_MINUTES } from "./commute.ts";

describe("commuteMinutes", () => {
  it("same depot uses transition floor", () => {
    const d = { id: "takaka", lat: -40.8536, lng: 172.8076 };
    assert.equal(commuteMinutes(d, d), TRANSITION_MINUTES);
  });

  it("Takaka to Richmond is a multi-hour road block", () => {
    const takaka = { id: "takaka", lat: -40.8536, lng: 172.8076 };
    const richmond = { id: "richmond", lat: -41.3394, lng: 173.187 };
    const km = haversineKm(takaka, richmond);
    assert.ok(km > 50 && km < 120, `km=${km}`);
    const mins = commuteMinutes(takaka, richmond);
    assert.ok(mins >= 75, `mins=${mins}`);
    assert.equal(mins % 15, 0);
  });
});
