import { test } from "node:test";
import assert from "node:assert/strict";
import { heuristicNarrative } from "../lib/heuristic";
import { generateStory } from "../lib/generator";
import { matchDemo, DEMO_WEEKS } from "../lib/demo";

test("heuristic detects a high-energy week", () => {
  const n = heuristicNarrative(
    "MON shipped the v2 launch, closed the Standard Bank deal. TUE crushed the sprint, back-to-back demos. WED launched on Product Hunt. THU signed the offer.",
  );
  assert.equal(n.tone, "high-energy");
});

test("heuristic detects a reflective week", () => {
  const n = heuristicNarrative(
    "MON tired, avoided the call again. TUE anxious, couldn't start. WED felt guilty about the thing I should have done. THU quiet, spent the day unsure.",
  );
  assert.equal(n.tone, "reflective");
});

test("heuristic output always generates a valid story and never throws", () => {
  const inputs = [
    "a single terse line about a day",
    "MON one. TUE two. WED three. THU four. FRI five.",
    "no punctuation just a stream of thoughts that never ends and keeps going and going without any structure at all really",
  ];
  for (const input of inputs) {
    const s = generateStory(heuristicNarrative(input));
    assert.equal(
      s.narrative.beats.filter((b) => b.kind === "turning-point").length,
      1,
    );
    assert.ok(s.narrative.beats.length >= 3);
  }
});

test("the turning point is never lifted from the opening line", () => {
  const n = heuristicNarrative(
    "Monday I finally decided to quit. Tuesday was ordinary. Wednesday I told my manager.",
  );
  const turn = n.beats.find((b) => b.kind === "turning-point");
  const opening = n.beats.find((b) => b.kind === "opening");
  assert.ok(turn && opening);
  assert.notEqual(turn!.headline, opening!.headline);
});

test("matchDemo returns the right baked reading for a prepared week", () => {
  for (const week of DEMO_WEEKS) {
    const matched = matchDemo(week.input);
    assert.ok(matched, `no match for ${week.id}`);
    assert.equal(matched!.title, week.narrative.title, week.id);
  }
  assert.equal(matchDemo("something totally unrelated to any demo"), null);
});
