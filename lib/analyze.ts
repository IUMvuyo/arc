import type { Narrative } from "./types";
import type { AIConfig } from "./ai-config";
import { isUsableConfig } from "./ai-config";
import { matchDemo } from "./demo";
import { heuristicNarrative } from "./heuristic";
import { runProviderAnalysis, ProviderError } from "./providers";

// Server-only. Do not import from a client component.

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

// The host's own OpenAI key, used when the visitor has not connected their own.
function envConfig(): AIConfig | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-5.6",
  };
}

// The analysis pass. Order:
//   1. If the visitor connected their own AI, use it (surface any failure).
//   2. Else if the host has a key configured, use it (fall back on failure).
//   3. Else the demo-safe fallbacks: baked reading, then local heuristic.
export async function analyzeWeek(
  input: string,
  image?: string,
  config?: unknown,
): Promise<Narrative> {
  const byo = isUsableConfig(config) ? config : null;

  if (byo) {
    // The visitor explicitly connected an AI. Use it, and surface any error so
    // they can fix their key, model, or endpoint rather than silently degrading.
    try {
      return await runProviderAnalysis(byo, input, image);
    } catch (err) {
      throw new AnalyzeError(
        err instanceof ProviderError
          ? err.message
          : "Your connected AI could not read that. Check your key and model.",
      );
    }
  }

  const host = envConfig();
  if (host) {
    try {
      return await runProviderAnalysis(host, input, image);
    } catch (err) {
      console.error("[arc] host AI analysis failed, falling back:", err);
      if (image) {
        throw new AnalyzeError(
          "Arc couldn't read that photo. Try a clearer shot, or paste the text.",
        );
      }
    }
  } else if (image) {
    throw new AnalyzeError(
      "Reading a photo needs an AI connection. Connect your own AI, paste the text, or try a prepared week.",
    );
  }

  // Text-only demo-safe fallbacks.
  return matchDemo(input) ?? heuristicNarrative(input);
}
