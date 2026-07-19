"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_INPUT } from "@/lib/demo";

const STATUS_LINES = [
  "Reading your week…",
  "Finding what recurred, what you avoided…",
  "Locating the turning point…",
  "Choosing the register…",
  "Composing the site…",
];

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!busy) return;
    setStatusIndex(0);
    const id = setInterval(() => {
      setStatusIndex((i) => Math.min(i + 1, STATUS_LINES.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, [busy]);

  async function build() {
    if (input.trim().length < 40) {
      setError("Give Arc a bit more of your week to read — a few days of notes.");
      areaRef.current?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      // Hold the reading sequence on screen long enough to land on camera,
      // even when the fallback returns instantly.
      const [res] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        }),
        new Promise((r) => setTimeout(r, 2600)),
      ]);
      const data = await res.json();
      if (!res.ok || !data?.narrative) {
        throw new Error(data?.error || "Arc couldn't read that. Try again.");
      }
      sessionStorage.setItem("arc:narrative", JSON.stringify(data.narrative));
      router.push("/story");
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <main className="grain relative min-h-screen bg-ink px-6 py-10 text-paper sm:px-10 md:px-16">
      <header className="flex items-baseline justify-between">
        <span className="font-display text-lg font-medium tracking-tight">Arc</span>
        <span className="max-w-[16rem] text-right font-body text-xs uppercase tracking-[0.25em] text-paper/45">
          a site built from your own week
        </span>
      </header>

      <div className="mx-auto flex min-h-[78vh] max-w-5xl flex-col justify-center py-16">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
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
          <textarea
            ref={areaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"MON — woke at 6:40, couldn't get back down.\ncalendar: 09:00 standup / 14:00 the call I keep moving…\njournal: told myself I'd finally send it. didn't."}
            rows={7}
            spellCheck={false}
            className="w-full resize-y rounded-none border-b border-paper/20 bg-transparent py-4 font-body text-base leading-relaxed text-paper placeholder:text-paper/25 focus:border-accent focus:outline-none"
          />

          <div className="mt-8 flex flex-wrap items-center gap-4">
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
            <button
              onClick={() => {
                setInput(DEMO_INPUT);
                setError(null);
                areaRef.current?.focus();
              }}
              disabled={busy}
              className="font-body text-sm uppercase tracking-[0.2em] text-paper/50 underline-offset-4 transition-colors hover:text-paper disabled:opacity-50"
              data-cursor="hover"
            >
              Use the demo week
            </button>
          </div>

          {error ? (
            <p className="mt-5 font-body text-sm text-accent">{error}</p>
          ) : null}
        </motion.div>
      </div>

      <footer className="flex items-center justify-between font-body text-xs uppercase tracking-[0.25em] text-paper/35">
        <span>GPT-5.6 reads · the engine builds</span>
        <span>nothing is stored</span>
      </footer>

      {/* The reading → composing sequence. */}
      <AnimatePresence>
        {busy ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6"
          >
            <div className="w-full max-w-md">
              <div className="h-px w-full overflow-hidden bg-paper/15">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((statusIndex + 1) / STATUS_LINES.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="mt-8 h-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-xl font-light tracking-tight text-paper"
                  >
                    {STATUS_LINES[statusIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
