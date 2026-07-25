"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PROVIDERS,
  defaultConfig,
  isUsableConfig,
  loadAIConfig,
  saveAIConfig,
  clearAIConfig,
  type AIConfig,
  type ProviderKind,
} from "@/lib/ai-config";

const EASE = [0.22, 1, 0.36, 1] as const;
const KINDS: ProviderKind[] = ["openai", "anthropic", "openai-compatible"];

// Plug-and-play: connect your own AI. Draft state lives here; on save it goes to
// localStorage and back up to the landing page. The key never leaves the browser
// except in the per-request call our server forwards to the provider.
export function AIConnect({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (cfg: AIConfig | null) => void;
}) {
  const [draft, setDraft] = useState<AIConfig>(() => defaultConfig("openai"));
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!open) return;
    const existing = loadAIConfig();
    if (existing) {
      setDraft(existing);
      setConnected(true);
    } else {
      setDraft(defaultConfig("openai"));
      setConnected(false);
    }
  }, [open]);

  const meta = PROVIDERS[draft.provider];
  const valid = isUsableConfig(draft);

  function pickProvider(kind: ProviderKind) {
    setDraft((d) => ({
      ...defaultConfig(kind),
      // Keep the key if the user already typed one.
      apiKey: d.apiKey,
    }));
  }

  function save() {
    if (!valid) return;
    saveAIConfig(draft);
    setConnected(true);
    onSaved(draft);
    onClose();
  }

  function disconnect() {
    clearAIConfig();
    setConnected(false);
    onSaved(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/85 px-5 py-12 backdrop-blur-sm sm:px-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl border border-paper/18 bg-ink"
          >
            <div className="flex items-center justify-between border-b border-paper/12 px-6 py-4">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent">
                connect your own AI
              </span>
              <button
                onClick={onClose}
                className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-paper/50 hover:text-paper"
                data-cursor="hover"
                aria-label="Close"
              >
                close
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="font-body text-sm leading-relaxed text-paper/55">
                Read your week with your own model. Pick a provider, paste a key,
                choose a model. Your key is stored only in this browser and used
                only to read your week. It is never saved on our servers.
              </p>

              {/* Provider */}
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {KINDS.map((kind) => {
                  const active = draft.provider === kind;
                  return (
                    <button
                      key={kind}
                      onClick={() => pickProvider(kind)}
                      data-cursor="hover"
                      className={`border px-3 py-2.5 text-left font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                        active
                          ? "border-accent text-paper"
                          : "border-paper/18 text-paper/55 hover:text-paper"
                      }`}
                    >
                      {PROVIDERS[kind].label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 font-mono text-[0.66rem] leading-relaxed text-paper/40">
                {meta.note}
              </p>

              {/* Fields */}
              <div className="mt-6 space-y-4">
                <Field label="API key">
                  <input
                    type="password"
                    value={draft.apiKey}
                    onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                    placeholder={meta.keyHint}
                    spellCheck={false}
                    autoComplete="off"
                    className="w-full border-b border-paper/20 bg-transparent py-2 font-mono text-sm text-paper placeholder:text-paper/25 focus:border-accent focus:outline-none"
                  />
                </Field>

                <Field label="Model">
                  <input
                    type="text"
                    value={draft.model}
                    onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                    placeholder={meta.modelHint}
                    spellCheck={false}
                    className="w-full border-b border-paper/20 bg-transparent py-2 font-mono text-sm text-paper placeholder:text-paper/25 focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1.5 font-mono text-[0.62rem] text-paper/35">{meta.modelHint}</p>
                </Field>

                {meta.needsBaseURL ? (
                  <Field label="Base URL">
                    <input
                      type="text"
                      value={draft.baseURL ?? ""}
                      onChange={(e) => setDraft({ ...draft, baseURL: e.target.value })}
                      placeholder={meta.baseURLHint}
                      spellCheck={false}
                      className="w-full border-b border-paper/20 bg-transparent py-2 font-mono text-sm text-paper placeholder:text-paper/25 focus:border-accent focus:outline-none"
                    />
                    <p className="mt-1.5 font-mono text-[0.62rem] text-paper/35">{meta.baseURLHint}</p>
                  </Field>
                ) : null}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={save}
                  disabled={!valid}
                  data-cursor="hover"
                  className="bg-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-transform duration-500 ease-arc hover:-translate-y-0.5 disabled:opacity-40"
                >
                  Connect
                </button>
                {connected ? (
                  <button
                    onClick={disconnect}
                    data-cursor="hover"
                    className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50 underline-offset-4 hover:text-paper hover:underline"
                  >
                    disconnect
                  </button>
                ) : null}
                <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-[0.18em] text-paper/30">
                  key stays in your browser
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-paper/45">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
