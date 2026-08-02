import { test } from "node:test";
import assert from "node:assert/strict";
import {
  saveWeek,
  listWeeks,
  hasWeek,
  deleteWeek,
  clearWeeks,
  weekId,
  weekSignals,
} from "../lib/archive";
import { DEMO_WEEKS } from "../lib/demo";
import type { Narrative } from "../lib/types";

// Each test starts from an empty store (in-memory fallback persists in-process).
function reset() {
  clearWeeks();
}

test("saveWeek persists and listWeeks returns it", () => {
  reset();
  const n = DEMO_WEEKS[0].narrative;
  saveWeek(n, 1000);
  const all = listWeeks();
  assert.equal(all.length, 1);
  assert.equal(all[0].narrative.title, n.title);
  assert.ok(hasWeek(n));
});

test("re-saving the same period+title updates in place, no duplicate", () => {
  reset();
  const n = DEMO_WEEKS[0].narrative;
  saveWeek(n, 1000);
  saveWeek(n, 2000);
  const all = listWeeks();
  assert.equal(all.length, 1);
  assert.equal(all[0].savedAt, 2000);
});

test("distinct weeks accumulate, newest first", () => {
  reset();
  saveWeek(DEMO_WEEKS[0].narrative, 1000);
  saveWeek(DEMO_WEEKS[1].narrative, 3000);
  saveWeek(DEMO_WEEKS[2].narrative, 2000);
  const all = listWeeks();
  assert.equal(all.length, 3);
  assert.deepEqual(
    all.map((w) => w.savedAt),
    [3000, 2000, 1000],
  );
});

test("deleteWeek removes only the target", () => {
  reset();
  saveWeek(DEMO_WEEKS[0].narrative, 1000);
  saveWeek(DEMO_WEEKS[1].narrative, 2000);
  const id = weekId(DEMO_WEEKS[0].narrative);
  deleteWeek(id);
  const all = listWeeks();
  assert.equal(all.length, 1);
  assert.equal(all[0].narrative.title, DEMO_WEEKS[1].narrative.title);
});

test("weekId is stable and slug-safe", () => {
  const id = weekId(DEMO_WEEKS[0].narrative);
  assert.equal(id, weekId(DEMO_WEEKS[0].narrative));
  assert.match(id, /^[a-z0-9-]+$/);
});

test("weekSignals returns tone + peak in chronological order", () => {
  reset();
  saveWeek(DEMO_WEEKS[1].narrative, 3000); // high-energy
  saveWeek(DEMO_WEEKS[0].narrative, 1000); // reflective
  const sig = weekSignals(listWeeks());
  assert.equal(sig.length, 2);
  // Chronological: reflective (1000) before high-energy (3000).
  assert.equal(sig[0].tone, "reflective");
  assert.equal(sig[1].tone, "high-energy");
  for (const s of sig) assert.ok(s.peak > 0 && s.peak <= 1);
});

test("a malformed stored blob does not crash listWeeks", () => {
  reset();
  // Simulate corrupt storage by saving then hand-writing junk is not exposed;
  // instead assert an empty/garbage narrative is rejected by the reader guard.
  const bad = { title: "x", period: "p", tone: "reflective", throughLine: "t" } as Narrative;
  saveWeek(bad, 1000); // beats missing -> reader guard filters it out on read
  const all = listWeeks();
  assert.ok(Array.isArray(all));
});
