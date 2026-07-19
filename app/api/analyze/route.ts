import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { Narrative } from "@/lib/types";
import { SYSTEM_PROMPT, NARRATIVE_SCHEMA, buildUserInput } from "@/lib/prompt";
import { DEMO_NARRATIVE, looksLikeDemo } from "@/lib/demo";
import { heuristicNarrative } from "@/lib/heuristic";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6";

export async function POST(req: Request) {
  let input = "";
  try {
    const body = await req.json();
    input = typeof body?.input === "string" ? body.input : "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (input.trim().length < 40) {
    return NextResponse.json(
      { error: "Give Arc a bit more of your week to read." },
      { status: 422 },
    );
  }

  // 1) The real analysis pass — GPT-5.6 via the Responses API, structured output.
  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: MODEL,
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
        return NextResponse.json({ narrative: parsed });
      }
    } catch (err) {
      // Fall through to the demo-safe path rather than failing on camera.
      console.error("[arc] GPT-5.6 analysis failed, falling back:", err);
    }
  }

  // 2) Demo-safe fallback: the baked reading for the prepared input,
  //    otherwise a local heuristic reading so any week still renders.
  const narrative: Narrative = looksLikeDemo(input)
    ? DEMO_NARRATIVE
    : heuristicNarrative(input);

  return NextResponse.json({ narrative });
}
