// The contract between the analysis pass (GPT-5.6) and the generation pass (Codex/engine).
// GPT-5.6 fills a Narrative. The generator normalizes it and composes a site from it.

export type Tone = "high-energy" | "reflective" | "growth" | "grounded";

// The section-type system. Codex assembles a site by ordering these.
// Exactly one beat in a story is the `turning-point` — it earns the one big motion moment.
export type BeatKind =
  | "opening" // the opening statement — one true sentence about the week
  | "theme" // a recurring thread that ran through the days
  | "texture" // data-as-texture — the raw material, rendered as atmosphere not a chart
  | "pull-line" // a single towering line — a realization held alone, full-bleed
  | "diptych" // two statements in tension — what you said vs what you did
  | "turning-point" // the moment the week changed — the hard visual break
  | "observation" // one honest, non-generic thing that is true
  | "closing"; // the closing line

export interface Beat {
  kind: BeatKind;
  /** Large display text — the thing you read first in this section. */
  headline: string;
  /** Supporting prose. Quiet, never padded. Optional for texture/closing. */
  body?: string;
  /**
   * For `texture` beats: short fragments lifted from the raw input, shown as texture.
   * For `diptych` beats: exactly two entries — the left and right sides of the tension.
   */
  fragments?: string[];
  /** A small label above the headline (e.g. "Tuesday", "the through-line"). Optional. */
  kicker?: string;
  /** 0..1 emotional intensity GPT-5.6 detected here. Drives the motion + type budget. */
  intensity: number;
}

export interface Narrative {
  /** Short, evocative, drawn from the actual week — never "Your Week in Review". */
  title: string;
  /** e.g. "the week of 10 March" — whatever period the input covers. */
  period: string;
  /** Chooses the accent pair + canvas. */
  tone: Tone;
  /** The honest one-liner. The whole site is a defense of this sentence. */
  throughLine: string;
  /** Ordered beats. First is `opening`, last is `closing`, exactly one `turning-point`. */
  beats: Beat[];
  meta?: {
    source?: "gpt-5.6" | "cache" | "heuristic";
  };
}

// ---- Generation output (what the renderer actually consumes) ----

export type Canvas = "ink" | "paper";

export interface AccentPair {
  tone: Tone;
  /** Human name, shown nowhere in the UI — used in dev/docs only. */
  name: string;
  /** "R G B" — consumed as rgb(var(--accent)). */
  accent: string;
  /** Muted companion for hairlines, kickers, secondary marks. */
  accentSoft: string;
  /** Lighter moods sit on paper; intense/quiet-dark moods sit on ink. */
  canvas: Canvas;
}

/** The shape of the week decides the rhythm, not a fixed template. */
export type StoryShape = "pivotal" | "steady";

export interface GeneratedStory {
  narrative: Narrative;
  accent: AccentPair;
  canvas: Canvas;
  shape: StoryShape;
  /** Index of the single turning-point beat within `narrative.beats`. */
  turningPointIndex: number;
}
