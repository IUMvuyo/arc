import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeNarrative, decodeNarrative, peekTitleTone } from "../lib/share";
import { DEMO_WEEKS } from "../lib/demo";

test("a narrative round-trips through encode and decode", () => {
  for (const week of DEMO_WEEKS) {
    const encoded = encodeNarrative(week.narrative);
    const decoded = decodeNarrative(encoded);
    assert.ok(decoded, `decode failed for ${week.id}`);
    assert.equal(decoded!.title, week.narrative.title, week.id);
    assert.equal(decoded!.beats.length, week.narrative.beats.length, week.id);
    assert.equal(decoded!.tone, week.narrative.tone, week.id);
  }
});

test("encoded strings are URL-safe", () => {
  for (const week of DEMO_WEEKS) {
    const encoded = encodeNarrative(week.narrative);
    assert.equal(encoded, encodeURIComponent(encoded), `not URL-safe: ${week.id}`);
  }
});

test("decode rejects junk and wrong versions", () => {
  assert.equal(decodeNarrative(""), null);
  assert.equal(decodeNarrative("not-base64!!"), null);
  assert.equal(decodeNarrative("9abcdef"), null); // wrong version prefix
});

test("peekTitleTone returns just the safe header fields", () => {
  const encoded = encodeNarrative(DEMO_WEEKS[0].narrative);
  const peek = peekTitleTone(encoded);
  assert.ok(peek);
  assert.equal(peek!.title, DEMO_WEEKS[0].narrative.title);
  assert.equal(peek!.tone, "reflective");
});
