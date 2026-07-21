# How Arc wins

This is the submission playbook: the pitch, how each judging criterion is answered,
what to do before the deadline, and the honest risks with their mitigations.

## The one line

Arc is an agent that reads your actual week and builds you a cinematic website
about it, generated live from your data, different every time. The model is in the
product's runtime loop, not just behind a build step.

## Why it wins on each criterion

**Technical implementation.** The interesting part is not that Codex helped build
the app. It is that the model is inside the running product: GPT-5.6 does the hard,
non templated interpretive reasoning (Responses API, structured output, vision,
streaming), and the engine composes bespoke UI per user at request time from a
constrained component library. That is a generation pipeline, not a static build.

**Design and UX.** The output is the product, so the design is not decoration. It
is an intentional editorial system: an asymmetric Swiss grid, a Space Mono label
voice held against a Fraunces variable display, oversized type that breaks its
container, a fragment marquee, and exactly one big kinetic moment that lands on the
detected turning point. Restraint is the tool. There is one heavy interaction per
site, never a motion demo.

**Potential impact.** Agent generated bespoke UI is a genuinely new interaction
pattern with obvious extensions beyond personal narrative: reports, retrospectives,
case studies, any dataset that has a story. Shareable permalinks give it a
distribution path built in.

**Quality of idea.** It is emotionally legible in ninety seconds and it has not
been done ten times this week. It is personal and a little true, which travels on a
demo video and a Devpost gallery full of dev tools.

## The differentiators to say out loud

1. The model is in the runtime loop, not just the build step.
2. The site is generated from the story's shape, not a template. A flat week and a
   pivotal week get structurally different pages.
3. It is honest, not flattering. It names what you avoided.
4. Every result is a shareable URL with its own social card.

## Before the deadline

Highest value first.

1. **Set the live key.** Add `OPENAI_API_KEY` in the Vercel project settings and
   redeploy so the live site uses real GPT-5.6 and photo vision, not the demo
   fallback. This is the single biggest lift for the "live" story.
2. **Record the demo video.** Follow `DEMO_SCRIPT.md`. The money shot is the live
   reading room resolving into the through-line, then the scroll to the kinetic
   turning point. Do not rush past it.
3. **Make the repo public** so judges can read the code:
   `gh repo edit IUMvuyo/arc --visibility public --accept-visibility-change-consequences`
4. **Write the Devpost copy** from the pitch and criteria map above.
5. **Pre generate one shared link** as a backup, so even if the live pass is slow
   on stage you can open a finished site instantly and honestly say what is live
   versus cached.

## Demo hygiene

- Open with a real, specific week, not a generic one. The prepared "week of
  avoidance" has a genuine turning point (avoidance, then the unplanned phone call).
- Keep the tab in the foreground while recording. Background tabs throttle the
  animation frame loop and the entrance reveals stall.
- Say plainly what is live and what is cached. Honesty reads as confidence.

## Risks and mitigations

- **Generation quality varies across inputs.** Mitigated by the constrained
  component library and the generator's guarantees (one turning point, clean open
  and close, detected shape). Better four reliable section types than twelve
  unreliable ones.
- **The kinetic moment is fiddly.** It is the one non negotiable. It is already
  built and driven by real scroll progress, and it degrades to a static heavy
  weight under reduced motion.
- **The live pass is slow or rate limited on stage.** Mitigated by the demo safe
  fallback and a pre generated shared link. The reading room looks the same either
  way.
- **Long shared URLs.** The narrative is a couple of kilobytes encoded, which
  every modern browser and Vercel handle. Copy link works regardless of length.

## What is deliberately out of scope

Real integrations, accounts, and native mobile. Saying this in the pitch shows
judgment. The responsive web build and shared links are enough to prove the idea.
