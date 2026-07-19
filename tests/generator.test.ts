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
