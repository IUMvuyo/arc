"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_WEEKS, type DemoWeek } from "@/lib/demo";
import { normalizeUpload } from "@/lib/ingest";
import { ACCENTS } from "@/lib/palette";
import type { Narrative, Tone } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

type StreamBeat = { kind: string; kicker: string; headline: string };

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [head, setHead] = useState<{ throughLine: string; tone: Tone } | null>(null);
  const [streamBeats, setStreamBeats] = useState<StreamBeat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [image, setImage] = useState<{ data: string; name: string } | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function ingestFile(file: File) {
    try {
      if (file.type.startsWith("image/")) {
        // A photo of a journal page / whiteboard — GPT-5.6 vision reads it.
        setImage({ data: await readImage(file), name: file.name });
        setError(null);
        return;
      }
      const text = await file.text();
      setInput(normalizeUpload(file.name, text));
      setImage(null);
      setError(null);
      areaRef.current?.focus();
    } catch {
      setError("Couldn't read that file. Try pasting the text instead.");
    }
  }

  async function build() {
    if (!image && input.trim().length < 40) {
      setError("Give Arc a bit more of your week to read — a few days of notes, or a photo.");
      areaRef.current?.focus();
      return;
    }
    setError(null);
    setHead(null);
    setStreamBeats([]);
    setBusy(true);

    try {
      const res = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, image: image?.data }),
      });
      if (!res.ok || !res.body) {
        throw new Error((await res.text()) || "Arc couldn't read that. Try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let narrative: Narrative | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!chunk.startsWith("data:")) continue;
          const msg = JSON.parse(chunk.slice(5).trim());
          if (msg.type === "through-line") {
            setHead({ throughLine: msg.value, tone: msg.tone as Tone });
          } else if (msg.type === "beat") {
            setStreamBeats((prev) => [...prev, msg as StreamBeat]);
          } else if (msg.type === "narrative") {
            narrative = msg.value as Narrative;
          } else if (msg.type === "error") {
            throw new Error(msg.value);
          }
        }
      }

      if (!narrative) throw new Error("Arc couldn't read that. Try again.");
      sessionStorage.setItem("arc:narrative", JSON.stringify(narrative));
      sessionStorage.setItem("arc:input", input);
      await new Promise((r) => setTimeout(r, 900));
      router.push("/story");
    } catch (e) {
      setBusy(false);
      setHead(null);
      setStreamBeats([]);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  function openExample(week: DemoWeek) {
    sessionStorage.setItem("arc:narrative", JSON.stringify(week.narrative));
    sessionStorage.setItem("arc:input", week.input);
    router.push("/story");
  }

  const streamAccent = head ? ACCENTS[head.tone].accent : "74 107 138";

  return (
    <main className="grain relative min-h-screen bg-ink text-paper">
      <div className="px-6 py-10 sm:px-10 md:px-16">
        <header className="flex items-baseline justify-between">
          <span className="font-display text-lg font-medium tracking-tight">Arc</span>
          <span className="max-w-[16rem] text-right font-body text-xs uppercase tracking-[0.25em] text-paper/45">
            a site built from your own week
          </span>
        </header>

        <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center py-16">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
            className="font-display text-[clamp(2.6rem,7.5vw,6rem)] font-light leading-[0.96] tracking-tightest"
          >
            Hand me a messy week.
            <br />
            <span className="text-accent">I&apos;ll show you its shape.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-8 max-w-xl font-body text-lg leading-relaxed text-paper/60"
          >
            Paste the mess — journal fragments, a calendar dump, a goals doc, voice
            notes. Arc finds the real narrative of the week and builds you a
            one-of-a-kind site that tells it back. Different every time, because
            your week is.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75 }}
            className="mt-12"
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const file = e.dataTransfer.files?.[0];
                if (file) ingestFile(file);
              }}
              className={`relative transition-colors ${drag ? "ring-1 ring-accent" : ""}`}
            >
              <textarea
                ref={areaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"MON — woke at 6:40, couldn't get back down.\ncalendar: 09:00 standup / 14:00 the call I keep moving…\njournal: told myself I'd finally send it. didn't."}
                rows={7}
                spellCheck={false}
                className="w-full resize-y rounded-none border-b border-paper/20 bg-transparent py-4 font-body text-base leading-relaxed text-paper placeholder:text-paper/25 focus:border-accent focus:outline-none"
              />
              {drag ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/70 font-body text-sm uppercase tracking-[0.25em] text-accent">
                  drop it — Arc will read it
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-body text-xs uppercase tracking-[0.2em] text-paper/35">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="underline-offset-4 transition-colors hover:text-paper"
                data-cursor="hover"
              >
                choose a file
              </button>
              <span>drop a .txt · .md · .ics · .json — or a photo of your notebook</span>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.ics,.json,.markdown,text/plain,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) ingestFile(file);
                  e.target.value = "";
                }}
              />
            </div>

            {image ? (
              <div className="mt-4 flex items-center gap-3 border border-accent/40 bg-accent/[0.06] px-3 py-2">
                <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">
                  photo attached
                </span>
                <span className="truncate font-body text-sm text-paper/70">{image.name}</span>
                <button
                  onClick={() => setImage(null)}
                  className="ml-auto font-body text-xs uppercase tracking-[0.2em] text-paper/50 hover:text-paper"
                  data-cursor="hover"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ) : null}

            <div className="mt-8">
              <button
                onClick={build}
                disabled={busy}
                className="group relative inline-flex items-center gap-3 bg-accent px-7 py-3 font-body text-sm font-medium uppercase tracking-[0.2em] text-ink transition-transform duration-500 ease-arc hover:-translate-y-0.5 disabled:opacity-50"
              >
                Build my site
                <span aria-hidden className="transition-transform duration-500 ease-arc group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-body text-xs uppercase tracking-[0.25em] text-paper/35">
                or paste a prepared week
              </span>
              {DEMO_WEEKS.map((week) => (
                <button
                  key={week.id}
                  onClick={() => {
                    setInput(week.input);
                    setError(null);
                    areaRef.current?.focus();
                  }}
                  disabled={busy}
                  className="border border-paper/20 px-3 py-1.5 font-body text-xs uppercase tracking-[0.15em] text-paper/60 transition-colors hover:border-accent hover:text-paper disabled:opacity-50"
                  data-cursor="hover"
                >
                  {week.label}
                </button>
              ))}
            </div>

            {error ? (
              <p className="mt-5 font-body text-sm text-accent">{error}</p>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Example gallery — three finished weeks, one tap away. */}
      <section className="border-t border-paper/10 px-6 py-24 sm:px-10 md:px-16">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-paper/40">
          three weeks Arc has already read
        </p>
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-paper/10 md:grid-cols-3">
          {DEMO_WEEKS.map((week) => {
            const accent = ACCENTS[week.narrative.tone];
            return (
              <button
                key={week.id}
                onClick={() => openExample(week)}
                data-cursor="hover"
                className="group relative flex flex-col justify-between gap-10 bg-ink p-8 text-left outline outline-1 outline-paper/10 transition-colors hover:bg-paper/[0.03] md:p-10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs uppercase tracking-[0.25em] text-paper/40">
                    {week.label}
                  </span>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: `rgb(${accent.accent})` }}
                  />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-light leading-tight tracking-tight">
                    {week.narrative.title}
                  </h3>
                  <p className="mt-4 font-body text-sm leading-relaxed text-paper/50">
                    {week.narrative.throughLine}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-paper/60 transition-colors group-hover:text-paper">
                    read the site
                    <span aria-hidden className="transition-transform duration-500 ease-arc group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="flex items-center justify-between px-6 py-8 font-body text-xs uppercase tracking-[0.25em] text-paper/35 sm:px-10 md:px-16">
        <span>GPT-5.6 reads · the engine builds</span>
        <span>nothing is stored</span>
      </footer>

      {/* The reading room — the through-line and beats assemble live. */}
      <AnimatePresence>
        {busy ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6"
            style={{ "--accent": streamAccent } as React.CSSProperties}
          >
            <div className="w-full max-w-xl">
              <div className="h-px w-full overflow-hidden bg-paper/15">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ width: `${Math.min(96, 10 + streamBeats.length * 12)}%` }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>

              <div className="mt-10 min-h-[3rem]">
                {head ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <p className="font-body text-xs uppercase tracking-[0.35em] text-accent">
                      what your week was about
                    </p>
                    <p className="mt-4 font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-light leading-snug tracking-tight text-paper">
                      {head.throughLine}
                    </p>
                  </motion.div>
                ) : (
                  <p className="font-display text-lg font-light tracking-tight text-paper/70">
                    Reading your week…
                  </p>
                )}
              </div>

              {streamBeats.length > 0 ? (
                <ul className="mt-8 space-y-2 border-t border-paper/10 pt-6">
                  <AnimatePresence initial={false}>
                    {streamBeats.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="flex items-baseline gap-3 font-body text-sm text-paper/55"
                      >
                        <span className="w-24 shrink-0 truncate text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                          {b.kicker || b.kind.replace("-", " ")}
                        </span>
                        <span className="truncate">{b.headline}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
