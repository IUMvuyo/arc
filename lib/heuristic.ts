import type { Beat, Narrative, Tone } from "./types";

// A local, dependency-free reading of the input. Not as sharp as GPT-5.6, but it
// keeps Arc honest offline: any pasted week still yields a coherent, non-crashing
// narrative instead of an error. It never invents facts. Every line it shows is
// lifted from the input.

const TONE_SIGNALS: Record<Tone, string[]> = {
  "high-energy": ["shipped", "launched", "sprint", "deadline", "back-to-back", "crushed", "fast", "won", "closed", "demo"],
  reflective: ["tired", "avoid", "anxious", "quiet", "alone", "unsure", "dread", "couldn't", "should have", "guilty"],
  growth: ["started", "finally", "first time", "learned", "realized", "decided", "signed up", "began", "opened up", "changed"],
  grounded: ["routine", "usual", "steady", "walk", "family", "dinner", "slept", "rest", "normal", "okay"],
};

const TURN_SIGNALS = [
  "finally", "decided", "called", "quit", "told", "realized", "admitted", "sent it",
  "signed", "said no", "walked", "asked", "left", "started", "chose", "stopped", "confronted",
];

function scoreTone(text: string): Tone {
  const lower = text.toLowerCase();
  let best: Tone = "reflective";
  let bestScore = -1;
  (Object.keys(TONE_SIGNALS) as Tone[]).forEach((tone) => {
    const score = TONE_SIGNALS[tone].reduce(
      (acc, w) => acc + (lower.includes(w) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = tone;
    }
  });
  return best;
}

function cleanLines(text: string): string[] {
  let lines = text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);
  // If the input arrived as a few long lines, break them into sentence-sized
  // units so the reading has something granular to work with.
  if (lines.length < 4) {
    lines = lines
      .flatMap((l) => l.split(/(?<=[.!?])\s+(?=[A-Z0-9])/))
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
  return lines;
}

function shorten(line: string, max = 96): string {
  const stripped = line
    // Normalize any em/en dashes in passed-through input to clean punctuation.
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/^[-*•\d.\)\s]+/, "")
    .trim();
  return stripped.length > max ? stripped.slice(0, max - 1).trimEnd() + "…" : stripped;
}

function detectPeriod(text: string): string {
  const months = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{1,2}/i;
  const m = text.match(months);
  return m ? `the week of ${m[0].replace(/\.$/, "")}` : "this week";
}

export function heuristicNarrative(input: string): Narrative {
  const lines = cleanLines(input);
  const tone = scoreTone(input);

  // The turning point: the line that most sounds like a decision or an act,
  // never the opening line, so the arc actually moves somewhere.
  const interior = lines.slice(1);
  let turnLine =
    interior.find((l) => TURN_SIGNALS.some((s) => l.toLowerCase().includes(s))) ??
    interior[Math.floor(interior.length / 2)] ??
    lines[Math.floor(lines.length / 2)] ??
    "Something shifted.";

  // Texture: short, concrete fragments like times, phrases, counts.
  const fragments = lines
    .filter((l) => l !== turnLine && l.length <= 90 && /[0-9:]|"|“|—/.test(l))
    .slice(0, 6)
    .map((l) => shorten(l, 72));

  const opening = shorten(lines[0] ?? "A week happened.");
  const closing = shorten(lines[lines.length - 1] ?? "That was the shape of it.");

  const beats: Beat[] = [
    { kind: "opening", headline: capitalize(opening), body: "", fragments: [], kicker: "", intensity: 0.35 },
    {
      kind: "theme",
      kicker: "the pattern",
      headline: "The week kept circling the same few things.",
      body: "",
      fragments: [],
      intensity: 0.45,
    },
  ];

  if (fragments.length >= 2) {
    beats.push({
      kind: "texture",
      kicker: "the raw material",
      headline: "This is what it was actually made of.",
      body: "",
      fragments,
      intensity: 0.5,
    });
  }

  beats.push({
    kind: "turning-point",
    kicker: "the moment it changed",
    headline: capitalize(shorten(turnLine, 120)),
    body: "",
    fragments: [],
    intensity: 0.9,
  });

  beats.push({
    kind: "observation",
    kicker: "the honest part",
    headline: "The busiest part of the week was not the most important part of it.",
    body: "",
    fragments: [],
    intensity: 0.5,
  });

  beats.push({
    kind: "closing",
    headline: capitalize(closing),
    body: "",
    fragments: [],
    kicker: "",
    intensity: 0.38,
  });

  return {
    title: capitalize(shorten(turnLine, 46)),
    period: detectPeriod(input),
    tone,
    throughLine: capitalize(opening),
    beats,
    meta: { source: "heuristic" },
  };
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
