"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_WEEKS, type DemoWeek } from "@/lib/demo";
import { normalizeUpload } from "@/lib/ingest";
import { ACCENTS } from "@/lib/palette";
import type { Narrative } from "@/lib/types";

const STATUS_LINES = [
  "Reading your week…",
  "Finding what recurred, what you avoided…",
  "Locating the turning point…",
  "Choosing the register…",
  "Composing the site…",
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [found, setFound] = useState<Narrative | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!busy || found) return;
    setStatusIndex(0);
    const id = setInterval(() => {
      setStatusIndex((i) => Math.min(i + 1, STATUS_LINES.length - 1));
    }, 850);
    return () => clearInterval(id);
  }, [busy, found]);

  async function ingestFile(file: File) {
    try {
      const text = await file.text();
      setInput(normalizeUpload(file.name, text));
      setError(null);
      areaRef.current?.focus();
    } catch {
      setError("Couldn't read that file. Try pasting the text instead.");
    }
  }

  async function build() {
    if (input.trim().length < 40) {
      setError("Give Arc a bit more of your week to read — a few days of notes.");
      areaRef.current?.focus();
      return;
    }
    setError(null);
    setFound(null);
    setBusy(true);
    try {
      const [res] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        }),
        new Promise((r) => setTimeout(r, 2200)),
      ]);
      const data = await res.json();
      if (!res.ok || !data?.narrative) {
        throw new Error(data?.error || "Arc couldn't read that. Try again.");
      }
      sessionStorage.setItem("arc:narrative", JSON.stringify(data.narrative));
      sessionStorage.setItem("arc:input", input);
      // Let the real found structure land before the site builds.
      setFound(data.narrative as Narrative);
      await new Promise((r) => setTimeout(r, 1700));
      router.push("/story");
    } catch (e) {
      setBusy(false);
      setFound(null);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  function openExample(week: DemoWeek) {
    sessionStorage.setItem("arc:narrative", JSON.stringify(week.narrative));
    sessionStorage.setItem("arc:input", week.input);
    router.push("/story");
  }

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
              <span>or drop a .txt · .md · .ics · .json — parsed on your device</span>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.ics,.json,.markdown,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) ingestFile(file);
                  e.target.value = "";
                }}
              />
            </div>

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

      {/* The reading → composing sequence, ending on what Arc actually found. */}
      <AnimatePresence>
        {busy ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6"
          >
            <div className="w-full max-w-lg">
              <div className="h-px w-full overflow-hidden bg-paper/15">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: found ? "100%" : `${((statusIndex + 1) / STATUS_LINES.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>

              {found ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="mt-10"
                >
                  <p className="font-body text-xs uppercase tracking-[0.35em] text-accent">
                    what your week was about
                  </p>
                  <p className="mt-5 font-display text-[clamp(1.4rem,3vw,2rem)] font-light leading-snug tracking-tight text-paper">
                    {found.throughLine}
                  </p>
                </motion.div>
              ) : (
                <div className="mt-8 h-8 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={statusIndex}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="font-display text-xl font-light tracking-tight text-paper"
                    >
                      {STATUS_LINES[statusIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
