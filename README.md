# Arc

**An agent that builds you a bespoke, cinematic website out of your own week.**

You hand Arc a messy pile of your own inputs: a journal export, a calendar dump, a
goals doc, voice notes transcribed to text, even a photo of your notebook. GPT-5.6
reads it and finds the actual shape of your week. What mattered, what you avoided,
the moment it turned. Then the engine composes a one of a kind scrollytelling site
that tells that story back. Different every time, because it is generated from your
real data, not a template with your name dropped in.

Built for OpenAI Build Week (Codex + GPT-5.6).

**Live:** https://arc-gold-beta.vercel.app
**Repo:** https://github.com/IUMvuyo/arc

---

## Why this is worth a look

Most hackathon entries put an AI behind a form. Arc puts the model inside the
product's runtime loop: GPT-5.6 does the hard interpretive reasoning, and the
generation engine assembles bespoke UI per user at request time. The output is
not decorated with a website, the output **is** the website. When form and
function are the same thing, judges notice.

Three things make it land in ninety seconds:

- It is viscerally demoable. Paste a week, watch it get read live, watch a site
  get built, scroll to a single kinetic moment that lands on the turning point.
- It is honest, not flattering. The reading names what you avoided, not just what
  you shipped. That is what makes it feel true instead of like a horoscope.
- Every generated site is shareable as its own URL, so the output travels.

---

## What is in it

- **Bring your own AI (plug and play).** Read your week with your own model. Connect
  **OpenAI**, **Anthropic (Claude)**, or **any OpenAI-compatible endpoint** (Ollama,
  Groq, OpenRouter, LM Studio, Together): pick a provider, paste a key, choose a
  model. The key is stored only in your browser and sent to the server only to read
  your week, never persisted or logged (`lib/ai-config.ts`, `lib/providers.ts`).
- **Multimodal input.** Paste text, or drop or choose a file: a `.ics` calendar
  export (parsed into readable time ordered lines), `.json`, `.md`, `.txt`, or a
  **photo of your notebook** that OpenAI or Claude vision reads directly. Files are
  handled on your device.
- **A live reading room.** A streaming endpoint sends the through-line first, then
  each beat as the reading assembles. You watch the model find the shape of your
  week in real time.
- **A generated cinematic site.** A film style title card, eight section types
  composed by narrative shape, one kinetic type moment at the detected turning
  point, a data derived "shape of the week" seismograph, section nav dots, and
  keyboard travel.
- **Shareable permalinks.** Every generated site is encoded into its own URL with
  no backend, and each shared link gets a personalized social preview card.
- **Three prepared weeks** in contrasting registers, one tap away, so the whole
  system is visible with zero setup and zero key.
- **Accessible and resilient.** Reduced motion is honored globally, the custom
  cursor and heavy motion switch off on touch, and it runs with no API key.

---

## How it works

Two passes, one contract (`lib/types.ts` defines the `Narrative`).

**1. Analysis (GPT-5.6).** The raw week goes to GPT-5.6 through the Responses API
with structured output. It returns a `Narrative`: a through-line, an ordered set
of beats, exactly one turning point, and a tone. The prompt (`lib/prompt.ts`) is
tuned to find the true shape, not to flatter, and it is told never to use em
dashes. A photo takes the same path through GPT-5.6 vision.

**2. Generation (the engine).** `lib/generator.ts` normalizes the narrative:
guarantees a clean opening and closing, forces exactly one turning point, lifts
its intensity for contrast, and detects the story **shape**. A pivotal week (one
beat towering over the baseline) gets a hard visual break at the turn; a steady
week stays visually calm. `components/StoryRenderer.tsx` then composes the page
from a constrained component library, one section type per beat kind.

The constraint is tight rules, loose content: a near black or paper canvas, one
of four pre vetted accent pairs chosen by tone, a Fraunces variable display face
held in tension with a Space Mono editorial label voice, restrained scroll
reveals, and exactly one big motion moment. At the turning point the display face
physically gains weight and optical size as it enters view, scaled to the emotional
intensity GPT-5.6 detected there.

---

## Run it

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for the live GPT-5.6 pass
npm run dev                  # http://localhost:3000
npm test                     # 20 unit tests
```

**No key needed to demo.** The analysis picks a source in this order: the AI the
visitor connected in the browser, else the host's `OPENAI_API_KEY`, else a baked
reading of the prepared weeks (`lib/demo.ts`), else a local heuristic reading
(`lib/heuristic.ts`). So a live demo never depends on the network, and anyone can
use it with their own key without the host configuring anything. The story shows an
honest badge: `read by <model>`, `demo reading`, or `local reading`.

Click any prepared week chip, or open a gallery card to jump straight into a
finished site.

---

## Section-type system

The model composes a site by ordering these eight types; the generator normalizes
the result and the renderer maps each to a component.

| Beat kind       | Component            | Role                                            |
|-----------------|----------------------|-------------------------------------------------|
| `opening`       | `OpeningStatement`   | One true sentence, monumental, full bleed       |
| `theme`         | `ThemeSection`       | A recurring thread, editorial split             |
| `texture`       | `DataTexture`        | The raw material as a ledger of real fragments  |
| `pull-line`     | `PullLine`           | A single towering realization, held alone       |
| `diptych`       | `Diptych`            | Two statements in tension, said versus did      |
| `turning-point` | `TurningPoint`       | The one kinetic type moment (one per site)      |
| `observation`   | `Observation`        | One honest, quiet aside                         |
| `closing`       | `ClosingLine`        | The arc resolved                                |

Plus a `TitleCard` cold open and a data derived `WeekShape` interstitial. Adding a
section type means adding a `BeatKind`, a component, a `StoryRenderer` case, and a
nav label. The generator handles ordering, the single turning point guarantee, and
rhythm.

---

## Accent pairs (tone chooses accent and canvas)

| Tone          | Accent            | Canvas |
|---------------|-------------------|--------|
| high-energy   | coral `#E8542E`   | ink    |
| reflective    | dusk `#4A6B8A`    | ink    |
| growth        | moss `#7A8C5E`    | paper  |
| grounded      | clay `#B08968`    | paper  |

Accent and canvas are the only things that vary structurally between stories. The
palette is pre vetted, never a random hex, which is how the output stays premium
under demo pressure instead of turning ugly on stage.

---

## Endpoints

- `POST /api/analyze` gives `{ input, image? }` and returns `{ narrative }`.
- `POST /api/analyze/stream` takes the same input and streams the reading as
  server sent events (`through-line`, then each `beat`, then `narrative`, then
  `done`).
- `GET /api/og?t=<title>&k=<tone>` renders the 1200 by 630 social preview card.

---

## Stack

Next.js 15 (App Router) with React 19, Tailwind with custom tokens, Framer Motion,
and the OpenAI Responses API for structured output, vision, and streaming. Deploys
to Vercel. Unit tests use `node:test` and `tsx` (`npm test`).

See [ARCHITECTURE.md](ARCHITECTURE.md) for the code map, [WINNING.md](WINNING.md)
for the submission strategy and the judging map, and [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
for the demo video.

---

## Out of scope (roadmap)

Real calendar and journal integrations, accounts and persistence beyond a shared
link, and a native mobile build. The responsive web build is enough for now.
