import { test } from "node:test";
import assert from "node:assert/strict";
import { generateStory } from "../lib/generator";
import { DEMO_WEEKS } from "../lib/demo";
import type { Beat, Narrative } from "../lib/types";

const beat = (kind: Beat["kind"], intensity: number, headline = "x"): Beat => ({
  kind,
  headline,
  body: "",
  fragments: [],
  kicker: "",
  intensity,
});

const base = (beats: Beat[]): Narrative => ({
  title: "t",
  period: "this week",
  tone: "reflective",
  throughLine: "a line",
  beats,
});

function countKind(n: Narrative, kind: Beat["kind"]) {
  return n.beats.filter((b) => b.kind === kind).length;
}

test("every generated story has exactly one turning point", () => {
  const none = generateStory(
    base([
      beat("opening", 0.3),
      beat("theme", 0.4),
      beat("theme", 0.9),
      beat("closing", 0.3),
    ]),
  );
  assert.equal(countKind(none.narrative, "turning-point"), 1);

  const many = generateStory(
    base([
      beat("opening", 0.3),
      beat("turning-point", 0.6),
      beat("turning-point", 0.9),
      beat("turning-point", 0.5),
      beat("closing", 0.3),
    ]),
  );
  assert.equal(countKind(many.narrative, "turning-point"), 1);
});

test("the turning point is never the first or last beat", () => {
  const s = generateStory(
    base([beat("opening", 0.3), beat("theme", 0.95), beat("closing", 0.3)]),
  );
  assert.ok(s.turningPointIndex > 0);
  assert.ok(s.turningPointIndex < s.narrative.beats.length - 1);
});

test("opening and closing are guaranteed even if missing", () => {
  const s = generateStory(base([beat("theme", 0.5), beat("theme", 0.9)]));
  assert.equal(s.narrative.beats[0].kind, "opening");
  assert.equal(s.narrative.beats[s.narrative.beats.length - 1].kind, "closing");
});

test("intensity is clamped into [0,1]", () => {
  const s = generateStory(
    base([beat("opening", -3), beat("theme", 5), beat("closing", 0.2)]),
  );
  for (const b of s.narrative.beats) {
    assert.ok(b.intensity >= 0 && b.intensity <= 1, `intensity ${b.intensity}`);
  }
});

test("shape detection: a towering beat is pivotal, a flat week is steady", () => {
  const pivotal = generateStory(
    base([
      beat("opening", 0.3),
      beat("theme", 0.3),
      beat("turning-point", 0.95),
      beat("theme", 0.3),
      beat("closing", 0.3),
    ]),
  );
  assert.equal(pivotal.shape, "pivotal");

  const steady = generateStory(
    base([
      beat("opening", 0.5),
      beat("theme", 0.55),
      beat("theme", 0.5),
      beat("closing", 0.5),
    ]),
  );
  assert.equal(steady.shape, "steady");
});

test("each baked demo week generates a valid, coherent story", () => {
  for (const week of DEMO_WEEKS) {
    const s = generateStory(week.narrative);
    assert.equal(countKind(s.narrative, "turning-point"), 1, week.id);
    assert.equal(s.narrative.beats[0].kind, "opening", week.id);
    assert.equal(
      s.narrative.beats[s.narrative.beats.length - 1].kind,
      "closing",
      week.id,
    );
    // The accent pair matches the declared tone.
    assert.equal(s.accent.tone, week.narrative.tone, week.id);
  }
});

test("no demo content contains an em or en dash", () => {
  const dash = /[—–]/;
  for (const week of DEMO_WEEKS) {
    assert.ok(!dash.test(week.input), `input has a dash: ${week.id}`);
    assert.ok(!dash.test(week.narrative.title), `title has a dash: ${week.id}`);
    assert.ok(!dash.test(week.narrative.throughLine), `throughLine has a dash: ${week.id}`);
    for (const b of week.narrative.beats) {
      assert.ok(!dash.test(b.headline), `headline has a dash: ${week.id}`);
      assert.ok(!dash.test(b.body ?? ""), `body has a dash: ${week.id}`);
      assert.ok(!dash.test((b.fragments ?? []).join(" ")), `fragment has a dash: ${week.id}`);
    }
  }
});

test("survives a degenerate reading (empty beats) without crashing", () => {
  const s = generateStory({
    title: "x",
    period: "this week",
    tone: "reflective",
    throughLine: "a line",
    beats: [],
  });
  assert.ok(s.narrative.beats.length >= 3);
  assert.equal(s.narrative.beats[0].kind, "opening");
  assert.equal(s.narrative.beats[s.narrative.beats.length - 1].kind, "closing");
  assert.equal(
    s.narrative.beats.filter((b) => b.kind === "turning-point").length,
    1,
  );
  // The turning point is a genuine interior beat, never the opening/closing.
  assert.ok(s.turningPointIndex > 0);
  assert.ok(s.turningPointIndex < s.narrative.beats.length - 1);
});

test("coerces an off-spec tone to a valid accent", () => {
  const s = generateStory({
    title: "x",
    period: "this week",
    // A connected model returns a tone outside our four.
    tone: "ecstatic" as never,
    throughLine: "y",
    beats: [
      { kind: "opening", headline: "h", body: "", fragments: [], kicker: "", intensity: 0.3 },
      { kind: "turning-point", headline: "t", body: "", fragments: [], kicker: "", intensity: 0.9 },
      { kind: "closing", headline: "c", body: "", fragments: [], kicker: "", intensity: 0.4 },
    ],
  });
  assert.equal(s.narrative.tone, "reflective");
  assert.equal(s.accent.tone, "reflective");
});

test("coerces non-string headlines and bad intensities from a weak model", () => {
  const s = generateStory({
    title: "x",
    period: "this week",
    tone: "growth",
    throughLine: "y",
    beats: [
      { kind: "opening", headline: 42 as never, body: "", fragments: [], kicker: "", intensity: "high" as never },
      { kind: "theme", headline: "real line", body: "", fragments: [], kicker: "", intensity: 5 as never },
      { kind: "closing", headline: "c", body: "", fragments: [], kicker: "", intensity: -3 as never },
    ],
  });
  for (const b of s.narrative.beats) {
    assert.equal(typeof b.headline, "string");
    assert.ok(b.intensity >= 0 && b.intensity <= 1);
  }
});
