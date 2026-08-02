import type { Narrative, Tone } from "./types";

// Local-first persistence. Every week you build is saved to this browser so Arc
// becomes something you return to, not a one-shot. The store is intentionally a
// clean, serializable shape so a later cloud sync (accounts) can mirror it 1:1.

export interface SavedWeek {
  /** Stable id derived from the period + title, so re-building a week updates it. */
  id: string;
  savedAt: number;
  narrative: Narrative;
}

const KEY = "arc:weeks";
const MAX_WEEKS = 60; // a year and a bit; oldest beyond this are dropped

// Use the browser's localStorage when there is a real DOM; otherwise an
// in-memory fallback so SSR and tests exercise the logic without a browser.
// (Gate on `window`, not a bare `globalThis.localStorage`, because recent Node
// exposes a non-persistent localStorage global that would silently drop writes.)
const memory: Record<string, string> = {};
function store(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (k) => (k in memory ? memory[k] : null),
    setItem: (k, v) => {
      memory[k] = v;
    },
    removeItem: (k) => {
      delete memory[k];
    },
  };
}

export function weekId(n: Narrative): string {
  const base = `${n.period} ${n.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "week";
}

function readAll(): SavedWeek[] {
  try {
    const raw = store().getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w) => w && typeof w.id === "string" && w.narrative && Array.isArray(w.narrative.beats),
    );
  } catch {
    return [];
  }
}

function writeAll(weeks: SavedWeek[]): void {
  try {
    store().setItem(KEY, JSON.stringify(weeks.slice(0, MAX_WEEKS)));
  } catch {
    /* quota or private mode: saving is best-effort */
  }
}

/** Newest first. */
export function listWeeks(): SavedWeek[] {
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export function hasWeek(n: Narrative): boolean {
  const id = weekId(n);
  return readAll().some((w) => w.id === id);
}

/** Save or update. Re-building the same period+title updates in place, no dupes. */
export function saveWeek(narrative: Narrative, savedAt: number): SavedWeek {
  const id = weekId(narrative);
  const entry: SavedWeek = { id, savedAt, narrative };
  const all = readAll().filter((w) => w.id !== id);
  all.unshift(entry);
  writeAll(all);
  return entry;
}

export function deleteWeek(id: string): void {
  writeAll(readAll().filter((w) => w.id !== id));
}

export function clearWeeks(): void {
  try {
    store().removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Longitudinal signal for the archive header: each saved week's tone and its
// peak intensity, in chronological order. The felt shape of a run of weeks.
export interface WeekSignal {
  id: string;
  tone: Tone;
  peak: number;
  title: string;
}

export function weekSignals(weeks: SavedWeek[]): WeekSignal[] {
  return [...weeks]
    .sort((a, b) => a.savedAt - b.savedAt)
    .map((w) => ({
      id: w.id,
      tone: w.narrative.tone,
      title: w.narrative.title,
      peak: w.narrative.beats.reduce((m, b) => Math.max(m, b.intensity ?? 0), 0),
    }));
}
