# Arc — design + generation decisions

## Cinematic language
- **Director register:** Villeneuve restraint (Arrival / Dune) — monumental type,
  void + a single light, deliberate reveals, one overwhelming beat. Matches the
  house "paper-first" system.
- **The one big beat = the turning point.** Kinetic type is the "arrival" — the
  display face gains mass (weight/opsz/SOFT) as the turning-point section enters view.
- **Composition family:** vertical descent through the week. Full-bleed held frames
  stacked; no top nav, no hero→features→CTA.

## Shell-ban (what a generated Arc site must never become)
- Centered gradient hero · card grid · pill metadata rows · Spotify-Wrapped carousel
- Gradient backgrounds, glassmorphism, floating 3D blobs (the AI-design tells)
- Numbered step markers unless content is genuinely sequential

## The constraint system (tight rules, loose content)
- **Canvas** is constant per tone: `#0E0E10` ink or `#FAFAF7` paper. Never variable per section.
- **Accent** is the one variable — 4 pre-vetted pairs, chosen by tone, never random hex.
- **Type:** Fraunces variable (display, axes opsz + SOFT + wght animated) · Inter (body).
- **Motion budget:** restrained scroll reveals everywhere; **exactly one** heavy
  interaction per site (the kinetic turning point). ≥4 distinct entrance types
  (rise / unveil / settle / hold / word-stagger / hairline-draw / texture-stagger /
  kinetic); `rise` used sparingly.
- **Custom cursor:** small radius glow, native cursor kept, hidden on touch + reduced-motion.

## Generation logic (why "generated" reads as intentional)
- GPT-5.6 returns ordered beats + one turning point + a tone.
- `generator.ts` normalizes: guarantees opening/closing, forces a single turning
  point (promote loudest / demote extras), lifts the peak for contrast, and detects
  **shape**: `pivotal` (one beat towering over the baseline) → hard visual break at
  the turn; `steady` (flat week) → stays visually calm. A flat week and a pivotal
  week get structurally different pages from the same components.

## Demo-safety (the on-camera path)
- Prepared demo week (`lib/demo.ts`) = a real, honest, messy week with a genuine
  turning point (avoidance → the unplanned phone call). Baked narrative used as the
  reliable fallback so it renders great with or without a key.
- Honesty badge on the story surfaces `read by gpt-5.6` vs `demo reading` vs `local reading`.

## Judging-criteria map
- **Technical:** engine composes bespoke UI at request time from GPT-5.6's structure — live pipeline, not a static build.
- **Design/UX:** Awwwards-register scroll storytelling, kinetic type, one big moment.
- **Impact:** a new interaction pattern — agent-generated bespoke UI — extensible beyond personal narrative.
- **Idea:** emotionally legible in 90s; not the tenth dev-tool wrapper of the week.
