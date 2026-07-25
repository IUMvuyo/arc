import OpenAI from "openai";
import type { Narrative } from "./types";
import type { AIConfig } from "./ai-config";
import { PROVIDERS } from "./ai-config";
import { SYSTEM_PROMPT, NARRATIVE_SCHEMA, buildUserInput } from "./prompt";

// Server-only. Dispatches the analysis to whichever AI the user connected.
// The user's key is used for the call and never logged or persisted here.

export class ProviderError extends Error {}

function parseNarrative(text: string | undefined, source: string): Narrative {
  if (!text) throw new ProviderError("The AI returned an empty reading.");
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    // Some models wrap JSON in prose or code fences; salvage the object.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new ProviderError("The AI did not return readable JSON.");
    obj = JSON.parse(match[0]);
  }
  const narrative = obj as Narrative;
  narrative.meta = { source };
  return narrative;
}

// Strip JSON Schema keywords that strict validators (Anthropic tools) reject.
// The generator clamps and normalizes anyway, so dropping bounds is safe.
function stripUnsupported(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(stripUnsupported);
  if (schema && typeof schema === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(schema as Record<string, unknown>)) {
      if (["minimum", "maximum", "multipleOf", "minLength", "maxLength", "format", "pattern"].includes(k)) {
        continue;
      }
      out[k] = stripUnsupported(v);
    }
    return out;
  }
  return schema;
}

function splitDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mediaType: m[1], base64: m[2] };
}

// A compact, model-agnostic description of the shape, for endpoints that only
// support plain JSON mode (no schema enforcement).
const SHAPE_HINT = `Return ONLY a JSON object of this exact shape, no prose, no code fences:
{"title": string, "period": string, "tone": "high-energy"|"reflective"|"growth"|"grounded", "throughLine": string, "beats": [{"kind": "opening"|"theme"|"texture"|"pull-line"|"diptych"|"turning-point"|"observation"|"closing", "headline": string, "body": string, "fragments": string[], "kicker": string, "intensity": number}]}
First beat kind "opening", last "closing", exactly one "turning-point". intensity is 0..1.`;

// ---- OpenAI (Responses API, structured output, vision) ----
async function runOpenAI(config: AIConfig, input: string, image?: string): Promise<Narrative> {
  const client = new OpenAI({ apiKey: config.apiKey });
  const format = {
    format: {
      type: "json_schema" as const,
      name: "narrative",
      strict: true,
      schema: NARRATIVE_SCHEMA as unknown as Record<string, unknown>,
    },
  };

  const userText = buildUserInput(
    input.trim() ||
      "My week is in the attached image: a journal page, a whiteboard, or my notes. Read it and find the shape.",
  );

  const response = image
    ? await client.responses.create({
        model: config.model,
        instructions: SYSTEM_PROMPT,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: userText },
              { type: "input_image", image_url: image, detail: "auto" },
            ],
          },
        ],
        text: format,
      })
    : await client.responses.create({
        model: config.model,
        instructions: SYSTEM_PROMPT,
        input: userText,
        text: format,
      });

  return parseNarrative(response.output_text, config.model);
}

// ---- Anthropic / Claude (Messages API via fetch, strict tool, vision) ----
async function runAnthropic(config: AIConfig, input: string, image?: string): Promise<Narrative> {
  const toolSchema = stripUnsupported(NARRATIVE_SCHEMA) as Record<string, unknown>;

  const userText = buildUserInput(
    input.trim() ||
      "My week is in the attached image: a journal page, a whiteboard, or my notes. Read it and find the shape.",
  );

  const content: unknown[] = [];
  if (image) {
    const parsed = splitDataUrl(image);
    if (parsed) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: parsed.mediaType, data: parsed.base64 },
      });
    }
  }
  content.push({ type: "text", text: userText });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
      tools: [
        {
          name: "narrative",
          description: "Return the structured narrative shape of the week.",
          input_schema: toolSchema,
          strict: true,
        },
      ],
      tool_choice: { type: "tool", name: "narrative" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Do not echo the key; the body is Anthropic's error, which never contains it.
    throw new ProviderError(anthropicErrorMessage(res.status, body));
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; input?: unknown }>;
  };
  const toolUse = data.content?.find((b) => b.type === "tool_use");
  if (!toolUse?.input) throw new ProviderError("Claude did not return a reading.");
  const narrative = toolUse.input as Narrative;
  narrative.meta = { source: config.model };
  return narrative;
}

function anthropicErrorMessage(status: number, body: string): string {
  if (status === 401) return "That Anthropic key was rejected. Check it and try again.";
  if (status === 404) return "That Claude model id was not found. Check the model name.";
  if (status === 429) return "Anthropic rate limit hit. Wait a moment and try again.";
  try {
    const j = JSON.parse(body);
    if (j?.error?.message) return `Claude: ${j.error.message}`;
  } catch {
    /* fall through */
  }
  return `Claude request failed (${status}).`;
}

// ---- OpenAI-compatible (Chat Completions, JSON mode, text only) ----
async function runCompatible(config: AIConfig, input: string, image?: string): Promise<Narrative> {
  if (image) {
    throw new ProviderError(
      "This endpoint reads text. For a photo, connect OpenAI or Anthropic, or paste the text.",
    );
  }
  const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });
  const completion = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${SHAPE_HINT}` },
      { role: "user", content: `${buildUserInput(input)}\n\n${SHAPE_HINT}` },
    ],
    response_format: { type: "json_object" },
  });
  return parseNarrative(completion.choices[0]?.message?.content ?? undefined, config.model);
}

export async function runProviderAnalysis(
  config: AIConfig,
  input: string,
  image?: string,
): Promise<Narrative> {
  if (image && !PROVIDERS[config.provider].supportsVision) {
    throw new ProviderError(
      "This endpoint reads text. For a photo, connect OpenAI or Anthropic, or paste the text.",
    );
  }
  switch (config.provider) {
    case "openai":
      return runOpenAI(config, input, image);
    case "anthropic":
      return runAnthropic(config, input, image);
    case "openai-compatible":
      return runCompatible(config, input, image);
    default:
      throw new ProviderError("Unknown provider.");
  }
}
