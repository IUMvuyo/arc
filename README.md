# Arc

**An agent that builds you a bespoke, cinematic website out of your own week.**

You hand Arc a messy pile of your own inputs — a journal export, a calendar dump, a
goals doc, voice notes transcribed to text. GPT-5.6 reads it and finds the actual
shape of your week: what mattered, what you avoided, the moment it turned. Then the
engine composes a one-of-a-kind scrollytelling site that tells that story back —
different every time, because it's generated from your real data, not a template
with your name dropped in.

Built for OpenAI Build Week (Codex + GPT-5.6).

---

## What's in it

- **Multimodal input** — paste text, or drop/choose a file: a `.ics` calendar
  export (parsed to readable time-ordered lines), `.json`, `.md`/`.txt`, **or a
  photo of your notebook** — GPT-5.6 vision reads a handwritten page directly
  (`lib/ingest.ts`, `lib/analyze.ts`). Files are handled on your device.
- **A live "watch it read" reveal** — a streaming endpoint (`/api/analyze/stream`,
  SSE) sends the through-line, then each beat as the reading assembles. The
  landing "reading room" renders them in real time — the same whether the reading
  came from the model or the demo-safe fallback.
- **Three prepared weeks in contrasting registers** — reflective/ink, high-energy/
  ink, growth/paper — as a landing gallery you can jump straight into, so the
  accent + canvas engine is visible with zero setup.
- **A generated cinematic site** — a film-style title card, one kinetic-type
  moment at the turning point, a data-derived "shape of the week" seismograph,
  eight section types composed by narrative shape, section nav dots, and keyboard
  travel (arrows / `j` / `k`).
- **Accessible + resilient** — `prefers-reduced-motion` honored globally
  (animations snap to visible), custom cursor and heavy motion disabled on touch.

---

## How it works

Two passes, one contract (`lib/types.ts` → `Narrative`).

1. **Analysis (GPT-5.6, `app/api/analyze/route.ts`).** The raw week goes to GPT-5.6
   via the **Responses API** with **structured output** — it returns a `Narrative`:
   a through-line, an ordered set of beats, exactly one turning point, and a tone.
   The prompt (`lib/prompt.ts`) is tuned to find the *true* shape, not a horoscope.

2. **Generation (`lib/generator.ts` → `components/StoryRenderer.tsx`).** The engine
   normalizes the narrative (guarantees a clean opening/closing, a single turning
   point, a detected *shape*) and composes the page from a **constrained component
   library** — one section-type per beat kind. This is the differentiator: Codex/the
   engine is in the runtime loop, assembling bespoke UI per story, not a static build.

The constraint is *tight rules, loose content*: near-black (or paper) canvas, one of
four pre-vetted accent pairs chosen by tone, Fraunces variable display + Inter body,
restrained scroll reveals, and **exactly one** big motion moment — the kinetic-type
beat at the turning point, where the display face physically gains weight as it
enters view, scaled to the intensity GPT-5.6 detected.

## Run it

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for the live GPT-5.6 pass
npm run dev                  # http://localhost:3000
```

**No key needed to demo.** Without `OPENAI_API_KEY`, Arc falls back to a baked
reading of the prepared demo week (`lib/demo.ts`), and to a local heuristic reading
(`lib/heuristic.ts`) for any other input — so the on-stage demo never depends on the
network. The story page shows an honest badge: `read by gpt-5.6` / `demo reading` /
`local reading`.

Click any **prepared week** chip or gallery card on the landing page.

## Section-type system

The model composes a site by ordering these eight types; the generator normalizes
the result and the renderer maps each to a component.

| Beat kind       | Component            | Role                                             |
|-----------------|----------------------|--------------------------------------------------|
| `opening`       | `OpeningStatement`   | One true sentence, monumental, full-bleed        |
| `theme`         | `ThemeSection`       | A recurring thread — editorial split             |
| `texture`       | `DataTexture`        | The raw material as a ledger of real fragments   |
| `pull-line`     | `PullLine`           | A single towering realization, held alone        |
| `diptych`       | `Diptych`            | Two statements in tension — said vs did          |
| `turning-point` | `TurningPoint`       | **The** kinetic-type moment (one per site)       |
| `observation`   | `Observation`        | One honest, quiet aside                          |
| `closing`       | `ClosingLine`        | The arc resolved                                 |

Plus a `TitleCard` cold open and a data-derived `WeekShape` interstitial, both
synthesized by the renderer. Adding a section type = add a `BeatKind`, a
component, a `StoryRenderer` case, and a nav label. The generator handles ordering,
the single-turning-point guarantee, and rhythm.

## Accent pairs (tone → accent + canvas)

| Tone          | Accent            | Canvas |
|---------------|-------------------|--------|
| high-energy   | coral `#E8542E`   | ink    |
| reflective    | dusk `#4A6B8A`    | ink    |
| growth        | moss `#7A8C5E`    | paper  |
| grounded      | clay `#B08968`    | paper  |

Accent + canvas are the *only* things that vary structurally between stories.

## Endpoints

- `POST /api/analyze` — `{ input, image? }` → `{ narrative }` (one-shot).
- `POST /api/analyze/stream` — same input, streams the reading as SSE
  (`through-line` → `beat`… → `narrative` → `done`) for the live reveal.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind (custom tokens, not defaults) ·
Framer Motion · OpenAI Responses API (structured output + vision + streaming) ·
deploys to Vercel. Unit tests: `node:test` + `tsx` (`npm test`).

## Deploy

```bash
vercel     # set OPENAI_API_KEY in project env for the live pass
```

## Out of scope (roadmap)

Real calendar/journal integrations · accounts/persistence · native mobile
(the responsive web build is enough).
