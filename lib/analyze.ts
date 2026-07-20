import OpenAI from "openai";
import type { Narrative } from "./types";
import { SYSTEM_PROMPT, NARRATIVE_SCHEMA, buildUserInput } from "./prompt";
import { matchDemo } from "./demo";
import { heuristicNarrative } from "./heuristic";

// Server-only. Do not import from a client component.

export const ANALYZE_MODEL = process.env.OPENAI_MODEL || "gpt-5.6";
export const MIN_INPUT = 40;

export function inputError(input: string): string | null {
  if (input.trim().length < MIN_INPUT) {
    return "Give Arc a bit more of your week to read.";
  }
  return null;
}

// The analysis pass with its full fallback chain: GPT-5.6 first, then the baked
// reading for a prepared week, then a local heuristic so any input still renders.
export async function analyzeWeek(input: string): Promise<Narrative> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: ANALYZE_MODEL,
        instructions: SYSTEM_PROMPT,
        input: buildUserInput(input),
        text: {
          format: {
            type: "json_schema",
            name: "narrative",
            strict: true,
            schema: NARRATIVE_SCHEMA as unknown as Record<string, unknown>,
          },
        },
      });
      const text = response.output_text;
      if (text) {
        const parsed = JSON.parse(text) as Narrative;
        parsed.meta = { source: "gpt-5.6" };
        return parsed;
      }
    } catch (err) {
      console.error("[arc] GPT-5.6 analysis failed, falling back:", err);
    }
  }
  return matchDemo(input) ?? heuristicNarrative(input);
}
