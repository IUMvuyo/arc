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

Click **Use the demo week** on the landing page for the prepared input.

## Section-type system

| Beat kind       | Component            | Role                                             |
|-----------------|----------------------|--------------------------------------------------|
| `opening`       | `OpeningStatement`   | One true sentence, monumental, full-bleed        |
| `theme`         | `ThemeSection`       | A recurring thread — editorial split             |
| `texture`       | `DataTexture`        | The raw material as a ledger of real fragments   |
| `turning-point` | `TurningPoint`       | **The** kinetic-type moment (one per site)       |
| `observation`   | `Observation`        | One honest, quiet aside                          |
| `closing`       | `ClosingLine`        | The arc resolved                                 |

Adding a new section type = add a `BeatKind`, a component, and a case in
`StoryRenderer`. The generator handles ordering and rhythm.

## Accent pairs (tone → accent + canvas)

| Tone          | Accent            | Canvas |
|---------------|-------------------|--------|
| high-energy   | coral `#E8542E`   | ink    |
| reflective    | dusk `#4A6B8A`    | ink    |
| growth        | moss `#7A8C5E`    | paper  |
| grounded      | clay `#B08968`    | paper  |

Accent + canvas are the *only* things that vary structurally between stories.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind (custom tokens, not defaults) ·
Framer Motion · OpenAI Responses API · deploys to Vercel.

## Deploy

```bash
vercel     # set OPENAI_API_KEY in project env for the live pass
```

## Out of scope (roadmap)

Real calendar/journal integrations · accounts/persistence · native mobile
(the responsive web build is enough).
