# Architecture

Arc is a two pass system with a strict contract between the passes. This document
maps the code so a reviewer can find anything in under a minute.

## The contract

Everything hinges on one type in `lib/types.ts`:

- `Narrative`: what GPT-5.6 produces and what the engine consumes. It holds a
  `title`, `period`, `tone`, `throughLine`, and an ordered array of `Beat`.
- `Beat`: a single section. It has a `kind` (one of eight), a `headline`, optional
  `body`, optional `fragments`, an optional `kicker`, and an `intensity` from 0 to 1.
- `GeneratedStory`: what the renderer consumes. It wraps a normalized `Narrative`
  with a resolved `accent`, `canvas`, `shape`, and `turningPointIndex`.

If you understand `Narrative`, you understand the whole system.

## Pass 1: analysis

`lib/analyze.ts` is the single entry point. It runs a fallback chain so the demo
never fails:

1. If `OPENAI_API_KEY` is set, call GPT-5.6 through the Responses API with strict
   structured output against `NARRATIVE_SCHEMA` (`lib/prompt.ts`). A photo takes
   the same call with an `input_image`.
2. Otherwise, if the pasted text matches a prepared week, return its baked reading
   (`lib/demo.ts`).
3. Otherwise, run the local heuristic (`lib/heuristic.ts`), which never invents
   facts and normalizes any dashes out of passed through text.

The prompt (`lib/prompt.ts`) is where the "feels true, not a horoscope" quality is
won. It instructs second person voice, forbids em dashes, requires exactly one
turning point, and defines the eight section types.

Two routes call `analyzeWeek`:

- `app/api/analyze/route.ts`: one shot, returns JSON.
- `app/api/analyze/stream/route.ts`: streams the reading as server sent events for
  the live reading room.

## Pass 2: generation

`lib/generator.ts` is pure and fully unit tested. It takes a raw `Narrative` and
returns a `GeneratedStory`. It guarantees:

- a clean `opening` first beat and `closing` last beat,
- exactly one `turning-point` (it promotes the loudest interior beat if the model
  marked none, and demotes extras if the model marked several),
- a lifted peak intensity at the turn for motion contrast,
- a detected `shape`: `pivotal` when one beat towers over the baseline, else
  `steady`.

`lib/palette.ts` maps the tone to one of four pre vetted accent pairs and a canvas.

## Rendering

`components/StoryRenderer.tsx` builds a flat list of sections from the beats,
inserts the `TitleCard` cold open and the `WeekShape` interstitial, sets the accent
and foreground CSS variables per story, and maps each beat kind to a component in
`components/sections/`.

The one signature interaction lives in `components/sections/TurningPoint.tsx`: it
drives the Fraunces variable axes (weight, optical size, softness) from scroll
progress, with the peak weight scaled to the beat's intensity.

Shared motion primitives are in `components/Reveal.tsx` (four distinct entrance
variants plus word by word and hairline reveals). The editorial label voice is in
`components/Label.tsx`, the fragment ticker in `components/Marquee.tsx`, the section
nav and keyboard travel in `components/NavDots.tsx`, and the custom cursor in
`components/Cursor.tsx`.

## Sharing

`lib/share.ts` encodes a whole `Narrative` into a URL safe string
(version prefixed base64url, isomorphic across browser and server). The story page
`app/story/page.tsx` is a server component that reads `?s=`, personalizes the
social metadata with a safe title and tone peek, and renders `StoryClient.tsx`.
`StoryClient` reconstructs the site from `?s=` or from the freshly generated
narrative in `sessionStorage`, and publishes a shareable permalink into the address
bar. `app/api/og/route.tsx` renders the personalized preview card with `next/og`.

## Tests

`npm test` runs `node:test` with `tsx`. Coverage:

- `tests/generator.test.ts`: the single turning point guarantee, opening and
  closing guarantees, intensity clamping, shape detection, and a rule that demo
  content stays free of em and en dashes.
- `tests/heuristic.test.ts`: tone detection and that any input yields a valid,
  non crashing story.
- `tests/ingest.test.ts`: the calendar parser.
- `tests/share.test.ts`: encode and decode round trips and URL safety.

## Data flow, end to end

```
paste or photo
   -> POST /api/analyze/stream
      -> analyzeWeek()  (GPT-5.6 | demo | heuristic)
         -> Narrative
   <- SSE: through-line, beats, narrative
   -> sessionStorage
   -> /story
      -> generateStory()  -> GeneratedStory
      -> StoryRenderer -> section components
      -> replaceState ?s=<encoded>  (shareable permalink)
```
