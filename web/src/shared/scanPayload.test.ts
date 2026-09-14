import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeScanPayload } from "./scanPayload.ts";

describe("normalizeScanPayload", () => {
  it("uppercases raw label codes", () => {
    assert.equal(normalizeScanPayload("sl-4821"), "SL-4821");
  });

  it("extracts code from absolute track URLs", () => {
    assert.equal(
      normalizeScanPayload("https://example.com/sollys/track?code=SL-4823"),
      "SL-4823",
    );
  });

  it("extracts code from relative track paths", () => {
    assert.equal(normalizeScanPayload("/track?code=sl-4821"), "SL-4821");
  });
});
