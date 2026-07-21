import type { AccentPair, Tone } from "./types";

// Four pre-vetted accent pairs. Generation shifts the accent (and canvas) only
// never structure, never an algorithmically random hex. This is how the output
// stays premium under demo pressure instead of turning ugly on stage.
export const ACCENTS: Record<Tone, AccentPair> = {
  "high-energy": {
    tone: "high-energy",
    name: "coral",
    accent: "232 84 46", // #E8542E, warm coral
    accentSoft: "168 74 54",
    canvas: "ink",
  },
  reflective: {
    tone: "reflective",
    name: "dusk",
    accent: "74 107 138", // #4A6B8A, dusk blue
    accentSoft: "96 118 145",
    canvas: "ink",
  },
  growth: {
    tone: "growth",
    name: "moss",
    accent: "122 140 94", // #7A8C5E, moss
    accentSoft: "120 132 100",
    canvas: "paper",
  },
  grounded: {
    tone: "grounded",
    name: "clay",
    accent: "176 137 104", // #B08968, clay
    accentSoft: "156 126 104",
    canvas: "paper",
  },
};

export function accentFor(tone: Tone): AccentPair {
  return ACCENTS[tone] ?? ACCENTS.reflective;
}
