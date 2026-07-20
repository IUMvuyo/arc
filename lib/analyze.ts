import OpenAI from "openai";
import type { Narrative } from "./types";
import { SYSTEM_PROMPT, NARRATIVE_SCHEMA, buildUserInput } from "./prompt";
import { matchDemo } from "./demo";
import { heuristicNarrative } from "./heuristic";

// Server-only. Do not import from a client component.

export const ANALYZE_MODEL = process.env.OPENAI_MODEL || "gpt-5.6";
export const MIN_INPUT = 40;

/** A user-facing failure the route can surface verbatim. */
export class AnalyzeError extends Error {}

export function inputError(input: string, hasImage = false): string | null {
  if (hasImage) return null; // an image carries the week on its own
  if (input.trim().length < MIN_INPUT) {
    return "Give Arc a bit more of your week to read.";
  }
  return null;
}

const RESPONSE_FORMAT = {
  format: {
    type: "json_schema" as const,
    name: "narrative",
    strict: true,
    schema: NARRATIVE_SCHEMA as unknown as Record<string, unknown>,
  },
};

function parseNarrative(text: string | undefined, source: Narrative["meta"]): Narrative {
  if (!text) throw new AnalyzeError("Arc couldn't read that. Try again.");
  const parsed = JSON.parse(text) as Narrative;
  parsed.meta = source;
  return parsed;
}

// The analysis pass with its full fallback chain: GPT-5.6 first, then the baked
// reading for a prepared week, then a local heuristic so any TEXT input still
// renders. An image can only be read by the model — there is no offline OCR.
export async function analyzeWeek(input: string, image?: string): Promise<Narrative> {
  const hasKey = !!process.env.OPENAI_API_KEY;

  // Vision path — a photo of a journal page, whiteboard, or notes.
  if (image) {
    if (!hasKey) {
      throw new AnalyzeError(
        "Arc reads photos with its GPT-5.6 connection, which isn't set up here. Paste the text instead, or try a prepared week.",
      );
    }
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: ANALYZE_MODEL,
        instructions: SYSTEM_PROMPT,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildUserInput(
                  input.trim() ||
                    "My week is in the attached image: a journal page, a whiteboard, or my notes. Read it and find the shape.",
                ),
              },
              { type: "input_image", image_url: image, detail: "auto" },
            ],
          },
        ],
        text: RESPONSE_FORMAT,
      });
      return parseNarrative(response.output_text, { source: "gpt-5.6" });
    } catch (err) {
      if (err instanceof AnalyzeError) throw err;
      console.error("[arc] GPT-5.6 vision analysis failed:", err);
      throw new AnalyzeError("Arc couldn't read that photo. Try a clearer shot, or paste the text.");
    }
  }

  // Text path — model first, then demo-safe fallbacks.
  if (hasKey) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: ANALYZE_MODEL,
        instructions: SYSTEM_PROMPT,
        input: buildUserInput(input),
        text: RESPONSE_FORMAT,
      });
      const text = response.output_text;
      if (text) return parseNarrative(text, { source: "gpt-5.6" });
    } catch (err) {
      console.error("[arc] GPT-5.6 analysis failed, falling back:", err);
    }
  }
  return matchDemo(input) ?? heuristicNarrative(input);
}
