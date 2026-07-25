import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isUsableConfig,
  defaultConfig,
  PROVIDERS,
  type AIConfig,
} from "../lib/ai-config";

test("defaultConfig seeds the provider's default model", () => {
  assert.equal(defaultConfig("openai").model, "gpt-5.6");
  assert.equal(defaultConfig("anthropic").model, "claude-opus-4-8");
  assert.equal(defaultConfig("openai-compatible").baseURL, "");
});

test("isUsableConfig accepts a complete OpenAI config", () => {
  const cfg: AIConfig = { provider: "openai", apiKey: "sk-test-123", model: "gpt-5.6" };
  assert.ok(isUsableConfig(cfg));
});

test("isUsableConfig accepts a complete Anthropic config", () => {
  const cfg: AIConfig = { provider: "anthropic", apiKey: "sk-ant-abc", model: "claude-opus-4-8" };
  assert.ok(isUsableConfig(cfg));
});

test("openai-compatible requires a valid base URL", () => {
  const noUrl: AIConfig = { provider: "openai-compatible", apiKey: "ollama", model: "llama" };
  assert.equal(isUsableConfig(noUrl), false);
  const badUrl = { ...noUrl, baseURL: "not-a-url" };
  assert.equal(isUsableConfig(badUrl), false);
  const ok = { ...noUrl, baseURL: "http://localhost:11434/v1" };
  assert.ok(isUsableConfig(ok));
});

test("isUsableConfig rejects junk, empty keys, and unknown providers", () => {
  assert.equal(isUsableConfig(null), false);
  assert.equal(isUsableConfig({}), false);
  assert.equal(isUsableConfig({ provider: "openai", apiKey: "", model: "x" }), false);
  assert.equal(isUsableConfig({ provider: "openai", apiKey: "sk-1", model: "" }), false);
  assert.equal(isUsableConfig({ provider: "gemini", apiKey: "k", model: "m" }), false);
});

test("every provider declares consistent metadata", () => {
  for (const kind of Object.keys(PROVIDERS) as (keyof typeof PROVIDERS)[]) {
    const m = PROVIDERS[kind];
    assert.equal(m.kind, kind);
    assert.ok(m.label.length > 0);
    assert.equal(typeof m.needsBaseURL, "boolean");
    assert.equal(typeof m.supportsVision, "boolean");
  }
});
