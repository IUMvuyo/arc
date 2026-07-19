import { test } from "node:test";
import assert from "node:assert/strict";
import { parseICS, normalizeUpload } from "../lib/ingest";

const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260317T090000Z
SUMMARY:Standup
END:VEVENT
BEGIN:VEVENT
DTSTART:20260317T140000Z
SUMMARY:The call I keep moving
END:VEVENT
END:VCALENDAR`;

test("parseICS turns events into readable, time-ordered lines", () => {
  const out = parseICS(SAMPLE_ICS);
  const lines = out.split("\n");
  assert.equal(lines.length, 2);
  assert.match(lines[0], /17 Mar 09:00 — Standup/);
  assert.match(lines[1], /17 Mar 14:00 — The call I keep moving/);
});

test("parseICS unfolds folded continuation lines", () => {
  const folded = `BEGIN:VEVENT
DTSTART:20260318
SUMMARY:A very long meeting title that the exporter
 wrapped across two lines
END:VEVENT`;
  const out = parseICS(folded);
  assert.match(out, /wrapped across two lines/);
  assert.ok(!out.includes("\n "));
});

test("parseICS hands back non-calendar text untouched", () => {
  const raw = "just a normal journal entry, no calendar here";
  assert.equal(parseICS(raw), raw);
});

test("normalizeUpload routes by extension", () => {
  assert.match(normalizeUpload("cal.ics", SAMPLE_ICS), /Standup/);
  const json = JSON.stringify([{ day: "Mon", note: "shipped v2" }]);
  assert.match(normalizeUpload("week.json", json), /day: Mon/);
  assert.equal(normalizeUpload("notes.txt", "hello"), "hello");
});
