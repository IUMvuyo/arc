"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_WEEKS, type DemoWeek } from "@/lib/demo";
import { normalizeUpload } from "@/lib/ingest";
import { ACCENTS } from "@/lib/palette";
import { Marquee } from "@/components/Marquee";
import { Label } from "@/components/Label";
import type { Narrative, Tone } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

// The raw material of a week, streaming past. Clean, no dashes.
const MARQUEE = [
  "06:40 awake before the alarm",
  "the doc, opened and closed",
  "lunch at the desk, day six",
  "goals doc untouched since Feb",
  "02:14 v2 is live, hands shaking",
  "product hunt, #2 by noon",
  "the shoes by the door since January",
  "next week, for two months",
  "the call you keep moving",
  "you sent the offer at 18:40",
  "2.1km, you walked half of it",
  "the investor update, five days late",
];

const PROCESS = [
  { n: "01", label: "You paste the mess", note: "journal, calendar, goals, a photo of your notebook" },
  { n: "02", label: "It finds the turn", note: "the one honest thing the week was about" },
  { n: "03", label: "It builds the site", note: "a bespoke, cinematic page, generated live" },
];

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
      setError("Could not read that file. Try pasting the text instead.");
    }
  }

  async function build() {
    if (!image && input.trim().length < 40) {
      setError("Give Arc a bit more of your week to read. A few days of notes, or a photo.");
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
        throw new Error((await res.text()) || "Arc could not read that. Try again.");
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

      if (!narrative) throw new Error("Arc could not read that. Try again.");
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
  const count = input.trim().length;

  return (
    <main className="grain relative min-h-screen overflow-x-hidden bg-ink text-paper">
      {/* Masthead */}
      <header className="flex items-center justify-between border-b border-paper/12 px-5 py-4 sm:px-8 md:px-12">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.3em]">Arc</span>
        <div className="hidden font-mono text-[0.7rem] uppercase tracking-[0.28em] text-paper/45 sm:block">
          an instrument for reading your own week
        </div>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-paper/45">
          Ed. 001 / 2026
        </span>
      </header>

      {/* Hero: asymmetric broken type against a mono process index */}
      <section className="grid grid-cols-1 gap-12 px-5 pb-20 pt-16 sm:px-8 md:grid-cols-12 md:gap-8 md:px-12 md:pb-28 md:pt-24">
        <div className="md:col-span-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
            className="font-display text-[clamp(3rem,11vw,9rem)] font-light leading-[0.86] tracking-tightest"
          >
            <span className="block">Hand me a</span>
            <span className="block">messy week.</span>
            <span className="mt-2 block text-accent">I&apos;ll show you</span>
            <span className="block text-accent">its shape.</span>
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col justify-end gap-8 md:col-span-4 md:pb-3"
        >
          <p className="max-w-xs font-body text-base leading-relaxed text-paper/60">
            You hand it the mess. GPT-5.6 finds the real narrative of the week, and
            the engine builds you a one of a kind site that tells it back. Different
            every time, because your week is.
          </p>
          <ul className="space-y-4 border-t border-paper/12 pt-6">
            {PROCESS.map((p) => (
              <li key={p.n} className="flex gap-4">
                <span className="font-mono text-[0.7rem] text-accent">{p.n}</span>
                <div>
                  <div className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-paper/80">
                    {p.label}
                  </div>
                  <div className="mt-1 font-body text-sm leading-snug text-paper/40">
                    {p.note}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Fragment marquee */}
      <Marquee items={MARQUEE} />

      {/* The instrument */}
      <section className="grid grid-cols-1 gap-10 px-5 py-20 sm:px-8 md:grid-cols-12 md:px-12 md:py-28">
        <div className="md:col-span-3">
          <Label index="→">your week</Label>
          <p className="mt-4 font-body text-sm leading-relaxed text-paper/45">
            However messy. Paste it, drop a file, or a photo of your notebook.
            Nothing is stored.
          </p>
        </div>

        <div className="md:col-span-9">
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
            className={`relative border ${drag ? "border-accent" : "border-paper/18"} transition-colors`}
          >
            <div className="flex items-center justify-between border-b border-paper/12 px-4 py-2.5">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-paper/45">
                input / paste below
              </span>
              <span className="font-mono text-[0.68rem] tabular-nums text-paper/35">
                {count} chars
              </span>
            </div>
            <textarea
              ref={areaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"MON. woke at 6:40, could not get back down.\ncalendar: 09:00 standup / 14:00 the call I keep moving.\njournal: told myself I would finally send it. did not."}
              rows={8}
              spellCheck={false}
              className="w-full resize-y bg-transparent px-4 py-4 font-mono text-sm leading-relaxed text-paper placeholder:text-paper/25 focus:outline-none"
            />
            {drag ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/75 font-mono text-sm uppercase tracking-[0.25em] text-accent">
                drop it. Arc will read it
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-paper/12 px-4 py-2.5">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-paper/45 underline-offset-4 transition-colors hover:text-paper"
                data-cursor="hover"
              >
                + file or photo
              </button>
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-paper/30">
                .txt .md .ics .json .jpg
              </span>
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
          </div>

          {image ? (
            <div className="mt-3 flex items-center gap-3 border border-accent/40 bg-accent/[0.06] px-3 py-2">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent">
                photo attached
              </span>
              <span className="truncate font-mono text-xs text-paper/70">{image.name}</span>
              <button
                onClick={() => setImage(null)}
                className="ml-auto font-mono text-xs text-paper/50 hover:text-paper"
                data-cursor="hover"
                aria-label="Remove photo"
              >
                remove
              </button>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={build}
              disabled={busy}
              className="group inline-flex items-center gap-4 bg-accent px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-ink transition-transform duration-500 ease-arc hover:-translate-y-0.5 disabled:opacity-50"
              data-cursor="hover"
            >
              Build my site
              <span aria-hidden className="transition-transform duration-500 ease-arc group-hover:translate-x-1">
                →
              </span>
            </button>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-paper/35">
                or load
              </span>
              {DEMO_WEEKS.map((week, i) => (
                <button
                  key={week.id}
                  onClick={() => {
                    setInput(week.input);
                    setImage(null);
                    setError(null);
                    areaRef.current?.focus();
                  }}
                  disabled={busy}
                  className="group inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-paper/55 transition-colors hover:text-paper disabled:opacity-50"
                  data-cursor="hover"
                >
                  <span className="text-accent/70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="border-b border-transparent group-hover:border-accent">
                    {week.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="mt-5 font-mono text-sm text-accent">{error}</p>
          ) : null}
        </div>
      </section>

      {/* Selected readings: an editorial contents index, not cards */}
      <section className="border-t border-paper/12 px-5 py-20 sm:px-8 md:px-12 md:py-28">
        <div className="flex items-baseline justify-between">
          <Label>selected readings</Label>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-paper/35">
            three weeks, already read
          </span>
        </div>

        <ul className="mt-10">
          {DEMO_WEEKS.map((week, i) => {
            const accent = ACCENTS[week.narrative.tone];
            return (
              <li key={week.id}>
                <button
                  onClick={() => openExample(week)}
                  data-cursor="hover"
                  className="group grid w-full grid-cols-12 items-center gap-4 border-t border-paper/12 py-7 text-left transition-colors last:border-b hover:bg-paper/[0.02]"
                >
                  <span className="col-span-2 font-mono text-sm text-accent/70 sm:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-10 font-display text-[clamp(1.6rem,4vw,3rem)] font-light leading-none tracking-tight transition-transform duration-500 ease-arc group-hover:translate-x-2 sm:col-span-6">
                    {week.narrative.title}
                  </span>
                  <span className="col-span-8 col-start-3 font-body text-sm leading-snug text-paper/45 sm:col-span-4 sm:col-start-auto">
                    {week.narrative.throughLine}
                  </span>
                  <span className="col-span-4 col-start-9 flex items-center justify-end gap-3 sm:col-span-1">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: `rgb(${accent.accent})` }}
                    />
                    <span aria-hidden className="font-mono text-paper/50 transition-transform duration-500 ease-arc group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Colophon */}
      <footer className="grid grid-cols-2 gap-4 border-t border-paper/12 px-5 py-10 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-paper/40 sm:px-8 md:grid-cols-4 md:px-12">
        <span>Arc</span>
        <span>GPT-5.6 reads</span>
        <span>the engine builds</span>
        <span className="md:text-right">nothing is stored</span>
      </footer>

      {/* The reading room: the through-line and beats assemble live */}
      <AnimatePresence>
        {busy ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col justify-center bg-ink px-5 sm:px-8 md:px-12"
            style={{ "--accent": streamAccent } as React.CSSProperties}
          >
            <div className="w-full max-w-3xl">
              <div className="mb-8 flex items-center gap-4">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent">
                  reading
                </span>
                <div className="h-px flex-1 overflow-hidden bg-paper/15">
                  <motion.div
                    className="h-full bg-accent"
                    animate={{ width: `${Math.min(96, 10 + streamBeats.length * 12)}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
              </div>

              <div className="min-h-[3rem]">
                {head ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <Label>what your week was about</Label>
                    <p className="mt-4 font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-light leading-snug tracking-tight text-paper">
                      {head.throughLine}
                    </p>
                  </motion.div>
                ) : (
                  <p className="font-display text-xl font-light tracking-tight text-paper/70">
                    Reading your week.
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
                        className="flex items-baseline gap-4 font-body text-sm text-paper/55"
                      >
                        <span className="w-28 shrink-0 truncate font-mono text-[0.64rem] uppercase tracking-[0.16em] text-accent">
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
