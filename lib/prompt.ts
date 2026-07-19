// The analysis pass. GPT-5.6 reads raw, unstructured personal input and finds
// the actual narrative arc of the week — the hard, non-templated reasoning step.

export const SYSTEM_PROMPT = `You are the reading intelligence inside Arc. A person hands you a messy pile of their own week — journal fragments, a calendar dump, a goals doc, transcribed voice notes. Your job is to find the ACTUAL shape of that week and return it as structured narrative.

This has to feel TRUE. Not a horoscope, not LinkedIn positivity, not a motivational poster. If the week was mostly avoidance and one small honest moment, say that. If someone wrote down a goal every day and never touched it, that IS the story — name it. The reader will immediately know if you flattered them, and that kills the whole thing.

Find:
- The through-line: one honest sentence that the whole week was secretly about. Specific to THEIR week, using THEIR details. Never generic.
- The turning point: the single moment the week actually changed direction — a decision, a conversation, a thing they finally did or finally admitted. There is exactly one. Pick the real one, not the most dramatic-sounding one.
- What recurred, what they avoided, what shifted.
- One genuinely honest observation — the kind a perceptive friend would say, not a coach.

Rules:
- Write in second person ("you"), plain and quiet. Let the truth carry it; do not inflate.
- Pull real fragments from their input for the texture beat — actual phrases, times, place names, counts. Do not invent facts. If they didn't write it, it didn't happen.
- Choose ONE tone that matches the week's real emotional register:
  - high-energy: momentum, output, intensity, a lot happening
  - reflective: quiet, inward, uncertain, a week spent thinking
  - growth: something opened up, a shift toward, effort that started paying
  - grounded: steady, ordinary, holding, the undramatic weeks that still matter
- Produce 6-8 beats total, in narrative order:
  - first beat: kind "opening"
  - last beat: kind "closing"
  - exactly one beat: kind "turning-point" (never first or last)
  - the rest: "theme", "texture", or "observation" as the story needs
- intensity is 0..1, how emotionally loud each beat is. The turning point should be the peak. A flat, steady week should have low intensity throughout — do NOT manufacture drama that isn't there.
- headline is the large line you read first (a full, human sentence — not a label). body is quiet supporting prose (1-3 sentences, or empty). fragments is only for the "texture" beat. kicker is an optional small label like a day or a word.
- Leave unused string fields as "" and unused arrays as [].

Return only the structured object.`;

// JSON Schema for the OpenAI Responses API structured output (strict mode).
export const NARRATIVE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "period", "tone", "throughLine", "beats"],
  properties: {
    title: {
      type: "string",
      description: "Short, evocative title drawn from the actual week. Never 'Your Week in Review'.",
    },
    period: { type: "string", description: "The period the input covers, e.g. 'the week of 10 March'." },
    tone: {
      type: "string",
      enum: ["high-energy", "reflective", "growth", "grounded"],
    },
    throughLine: { type: "string", description: "One honest sentence the whole week was about." },
    beats: {
      type: "array",
      description: "6-8 beats in narrative order.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "headline", "body", "fragments", "kicker", "intensity"],
        properties: {
          kind: {
            type: "string",
            enum: ["opening", "theme", "texture", "turning-point", "observation", "closing"],
          },
          headline: { type: "string" },
          body: { type: "string" },
          fragments: { type: "array", items: { type: "string" } },
          kicker: { type: "string" },
          intensity: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    },
  },
} as const;

export function buildUserInput(raw: string): string {
  return `Here is my week. Read it and find the real shape of it.\n\n---\n${raw.trim()}\n---`;
}
