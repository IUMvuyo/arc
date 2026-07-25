// The plug-and-play contract. A user connects their own AI: pick a provider,
// paste a key, choose a model. The config is stored only in their browser and
// sent to our server per request to read their week. It is never persisted or
// logged server-side. Shared by client (settings panel) and server (dispatch).

export type ProviderKind = "openai" | "anthropic" | "openai-compatible";

export interface AIConfig {
  provider: ProviderKind;
  apiKey: string;
  model: string;
  /** Only for openai-compatible endpoints (Ollama, Groq, OpenRouter, LM Studio). */
  baseURL?: string;
}

export interface ProviderMeta {
  kind: ProviderKind;
  label: string;
  defaultModel: string;
  needsBaseURL: boolean;
  supportsVision: boolean;
  keyHint: string;
  modelHint: string;
  baseURLHint?: string;
  note: string;
}

export const PROVIDERS: Record<ProviderKind, ProviderMeta> = {
  openai: {
    kind: "openai",
    label: "OpenAI",
    defaultModel: "gpt-5.6",
    needsBaseURL: false,
    supportsVision: true,
    keyHint: "sk-...",
    modelHint: "gpt-5.6",
    note: "Responses API with structured output. Reads text and photos.",
  },
  anthropic: {
    kind: "anthropic",
    label: "Anthropic (Claude)",
    defaultModel: "claude-opus-4-8",
    needsBaseURL: false,
    supportsVision: true,
    keyHint: "sk-ant-...",
    modelHint: "claude-opus-4-8 · claude-sonnet-5 · claude-haiku-4-5",
    note: "Messages API with a strict tool. Reads text and photos.",
  },
  "openai-compatible": {
    kind: "openai-compatible",
    label: "OpenAI-compatible",
    defaultModel: "",
    needsBaseURL: true,
    supportsVision: false,
    keyHint: "any key the endpoint needs (or 'ollama')",
    modelHint: "llama-3.3-70b · qwen2.5 · mixtral · your model id",
    baseURLHint: "http://localhost:11434/v1 · https://api.groq.com/openai/v1",
    note: "Any Chat Completions endpoint: Ollama, Groq, OpenRouter, LM Studio, Together. Text only.",
  },
};

export function defaultConfig(kind: ProviderKind): AIConfig {
  return {
    provider: kind,
    apiKey: "",
    model: PROVIDERS[kind].defaultModel,
    baseURL: PROVIDERS[kind].needsBaseURL ? "" : undefined,
  };
}

/** A config is usable if it has a key, a model, and a base URL when required. */
export function isUsableConfig(cfg: unknown): cfg is AIConfig {
  if (!cfg || typeof cfg !== "object") return false;
  const c = cfg as Partial<AIConfig>;
  if (c.provider !== "openai" && c.provider !== "anthropic" && c.provider !== "openai-compatible") {
    return false;
  }
  if (typeof c.apiKey !== "string" || c.apiKey.trim().length < 3) return false;
  if (typeof c.model !== "string" || c.model.trim().length < 1) return false;
  if (PROVIDERS[c.provider].needsBaseURL) {
    if (typeof c.baseURL !== "string" || !/^https?:\/\//i.test(c.baseURL.trim())) return false;
  }
  return true;
}

// ---- Client-side persistence (browser only) ----

const STORAGE_KEY = "arc:ai";

export function loadAIConfig(): AIConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isUsableConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAIConfig(cfg: AIConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function clearAIConfig(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
