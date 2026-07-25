# Devpost submission copy

Ready to paste. No em dashes. Swap the bracketed video link before submitting.

---

## Name

Arc

## Tagline (elevator pitch, one line)

An agent that reads your actual week and builds you a bespoke, cinematic website about it.

## Links

- Live: https://arc-gold-beta.vercel.app
- Repo: https://github.com/IUMvuyo/arc
- Demo video: [paste link]

## Built with

Next.js, React, TypeScript, Tailwind, Framer Motion, OpenAI Responses API (structured output, vision, streaming), Anthropic Messages API, Vercel.

---

## Inspiration

Every "year in review" feature is the same template with your numbers dropped in. We wanted the opposite: a site whose whole structure comes from your actual week, so a flat week and a week with one hard turning point produce genuinely different pages. The interesting question was not "can an AI summarize my week" but "can a model read the real shape of it, and can that shape drive a generated interface." A messy week has a narrative. We wanted to give it a form.

## What it does

You hand Arc a messy pile of your own inputs: journal fragments, a calendar dump, a goals doc, or a photo of your notebook. It reads them and finds the real narrative of the week. What recurred, what you avoided, the single moment it turned, one honest observation. Then it composes a one of a kind scrollytelling site that tells that story back, with one big kinetic type moment landing exactly on the turning point. Different every time, because your week is.

Three things make it land:

- It is honest, not flattering. If the week was mostly avoidance and one real moment, it says that. That is what makes it feel true instead of like a horoscope.
- Every generated site is its own shareable URL with a personalized social preview card, so the output travels.
- You can plug in your own AI. Connect OpenAI, Anthropic, or any OpenAI-compatible endpoint (Ollama, Groq, OpenRouter, LM Studio). Your key stays in your browser. Arc is an open instrument, not a closed demo.

## How we built it

Two passes with a strict contract between them.

1. Analysis: the raw week goes to the model with structured output, and it returns a Narrative: a through-line, an ordered set of beats, exactly one turning point, and a tone. A streaming endpoint sends the through-line and each beat as they are found, so you watch the reading assemble in real time.

2. Generation: an engine normalizes the narrative (guarantees a clean opening and closing, forces a single turning point, detects whether the week is pivotal or steady) and composes the page from a constrained library of eight section types, ordered by the shape of the story. The one signature interaction drives a variable font's weight and optical size from scroll progress at the turning point, scaled to the emotional intensity the model detected there.

The design is an intentional editorial system, not a template: an asymmetric grid, a monospace label voice held against a serif display, oversized type that breaks its container, and exactly one heavy motion moment per site. The constraint is tight rules, loose content, so a generated site always feels premium and never breaks.

## Challenges we ran into

- Making the reading feel true, not like a horoscope. The whole thing dies if it flatters you. We tuned the prompt hard toward naming what you avoided, and forbade the tells of generic AI writing.
- Keeping "generated" from feeling random. The fix was a constrained component system with hard guarantees (one turning point, a detected shape) so structure is always intentional.
- Making it robust to any model. Once you let people bring their own AI, a weak model can return off-spec output. The generator coerces and normalizes everything so the renderer can never break.
- Shipping shareable output with no backend. The whole narrative is encoded into the URL, so every result is a permalink with its own preview card, and nothing is stored.

## What we learned

Putting the model inside the product's runtime loop, generating bespoke UI per user at request time, is a stronger and more surprising use than putting it behind a build step. And restraint is the design tool: one big motion moment reads as intentional, three read as templated.

## What's next

Real calendar and journal integrations, saved histories, and a native mobile build. The interaction pattern, an agent generating bespoke UI from your own data, extends well beyond personal narrative: retrospectives, reports, case studies, anything with a story in it.
