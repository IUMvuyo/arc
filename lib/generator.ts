import type { Beat, GeneratedStory, Narrative, StoryShape } from "./types";
import { accentFor } from "./palette";

const clamp01 = (n: number): number =>
  Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.4;

// Normalize whatever the analysis pass returned into a story the renderer can
// trust: a clean opening, exactly one turning point, a closing line, and a
// detected shape that drives the page rhythm. This is the constraint system
// tight rules, loose content, so a generated site is never structurally broken.
export function generateStory(raw: Narrative): GeneratedStory {
  const tone = raw.tone ?? "reflective";
  const accent = accentFor(tone);

  let beats: Beat[] = (raw.beats ?? [])
    .filter((b) => b && b.headline)
    .map((b) => ({ ...b, intensity: clamp01(b.intensity) }));

  // Guarantee an opening statement.
  if (beats.length === 0 || beats[0].kind !== "opening") {
    beats.unshift({
      kind: "opening",
      headline: raw.throughLine || raw.title || "A week happened.",
      intensity: 0.35,
    });
  }

  // Guarantee a closing line.
  if (beats[beats.length - 1]?.kind !== "closing") {
    beats.push({
      kind: "closing",
      headline: raw.throughLine || "That was the shape of it.",
      intensity: 0.3,
    });
  }

  // Guarantee exactly one turning point. If the model marked none, promote the
  // most intense interior beat. If it marked several, keep the strongest and
  // demote the rest to themes, the one big moment stays singular by design.
  const turningIdxs = beats
    .map((b, i) => (b.kind === "turning-point" ? i : -1))
    .filter((i) => i > 0 && i < beats.length - 1);

  let turningPointIndex: number;
  if (turningIdxs.length === 1) {
    turningPointIndex = turningIdxs[0];
  } else if (turningIdxs.length > 1) {
    turningPointIndex = turningIdxs.reduce((best, i) =>
      beats[i].intensity > beats[best].intensity ? i : best,
    );
    for (const i of turningIdxs) {
      if (i !== turningPointIndex) beats[i] = { ...beats[i], kind: "theme" };
    }
  } else {
    // No turning point declared, find the loudest interior beat and make it one.
    let best = 1;
    for (let i = 1; i < beats.length - 1; i++) {
      if (beats[i].intensity >= beats[best].intensity) best = i;
    }
    turningPointIndex = Math.min(best, beats.length - 2);
    beats[turningPointIndex] = { ...beats[turningPointIndex], kind: "turning-point" };
  }

  // The turning point is always the peak, lift it above its neighbours so the
  // kinetic-type moment has real contrast to animate through.
  beats[turningPointIndex] = {
    ...beats[turningPointIndex],
    intensity: Math.max(beats[turningPointIndex].intensity, 0.82),
  };

  // Detect the shape of the week. A pivotal week (one beat towering over the
  // rest) earns a hard visual break; a steady week stays visually calm.
  const shape = detectShape(beats, turningPointIndex);

  return {
    narrative: { ...raw, tone, beats },
    accent,
    canvas: accent.canvas,
    shape,
    turningPointIndex,
  };
}

function detectShape(beats: Beat[], turningPointIndex: number): StoryShape {
  const peak = beats[turningPointIndex]?.intensity ?? 0;
  const others = beats
    .filter((_, i) => i !== turningPointIndex)
    .map((b) => b.intensity);
  const avg = others.length
    ? others.reduce((a, b) => a + b, 0) / others.length
    : 0;
  // A real turning point stands clearly above the baseline of the week.
  return peak - avg >= 0.32 && peak >= 0.7 ? "pivotal" : "steady";
}
