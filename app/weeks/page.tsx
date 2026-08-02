"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { listWeeks, deleteWeek, weekSignals, type SavedWeek } from "@/lib/archive";
import { syncWeekRemove } from "@/lib/cloud";
import { encodeNarrative } from "@/lib/share";
import { ACCENTS } from "@/lib/palette";
import { Label } from "@/components/Label";
import { useCloud } from "@/components/CloudProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

// A quiet date, in Arc's plain voice.
function savedLabel(ms: number): string {
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(ms));
  } catch {
    return "";
  }
}

export default function WeeksPage() {
  const [weeks, setWeeks] = useState<SavedWeek[] | null>(null);
  const { ready, user, status, version, signIn, signOut } = useCloud();

  // Re-read the local archive on mount and whenever a cloud pull changed it.
  useEffect(() => {
    setWeeks(listWeeks());
  }, [version]);

  function remove(id: string) {
    deleteWeek(id);
    void syncWeekRemove(id);
    setWeeks(listWeeks());
  }

  const signals = weeks ? weekSignals(weeks) : [];

  return (
    <main className="grain relative min-h-screen bg-ink text-paper">
      {/* Masthead */}
      <header className="flex items-center justify-between border-b border-paper/12 px-5 py-4 sm:px-8 md:px-12">
        <Link
          href="/"
          className="font-mono text-sm font-bold uppercase tracking-[0.3em] hover:opacity-80"
          data-cursor="hover"
        >
          Arc
        </Link>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-paper/45">
          your weeks
        </span>
        <Link
          href="/"
          className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent hover:opacity-80"
          data-cursor="hover"
        >
          + new week
        </Link>
      </header>

      {/* Cloud sync bar. Only when this deployment has Firebase configured. */}
      {ready ? (
        <div className="flex items-center justify-between border-b border-paper/12 px-5 py-3 font-mono text-[0.66rem] uppercase tracking-[0.22em] sm:px-8 md:px-12">
          {user ? (
            <>
              <span className="flex items-center gap-2 text-paper/50">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {status === "syncing" ? "syncing…" : "synced"} · {user.email ?? "signed in"}
              </span>
              <button
                onClick={() => signOut()}
                data-cursor="hover"
                className="text-paper/45 hover:text-paper"
              >
                sign out
              </button>
            </>
          ) : (
            <>
              <span className="text-paper/45">
                sync your weeks across devices
              </span>
              <button
                onClick={() => signIn()}
                data-cursor="hover"
                className="text-accent hover:opacity-80"
              >
                sign in with Google →
              </button>
            </>
          )}
        </div>
      ) : null}

      <div className="px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="max-w-[22ch] font-display text-[clamp(2.4rem,7vw,5.5rem)] font-light leading-[0.92] tracking-tightest"
        >
          A record of your weeks, one shape at a time.
        </motion.h1>

        {weeks === null ? null : weeks.length === 0 ? (
          <div className="mt-16 border-t border-paper/12 pt-10">
            <Label>nothing saved yet</Label>
            <p className="mt-5 max-w-md font-body text-lg leading-relaxed text-paper/55">
              Every week you build is saved here, so you can watch the months take
              shape. Build your first one and it will land in this archive.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-3 bg-accent px-7 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-transform duration-500 ease-arc hover:-translate-y-0.5"
              data-cursor="hover"
            >
              Build a week
              <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Longitudinal header: the felt shape of your saved weeks */}
            {signals.length > 1 ? (
              <section className="mt-14">
                <Label>the shape of your months</Label>
                <div className="mt-6 flex h-24 items-end gap-1.5" aria-hidden>
                  {signals.map((s) => {
                    const accent = ACCENTS[s.tone] ?? ACCENTS.reflective;
                    return (
                      <div
                        key={s.id}
                        title={s.title}
                        className="w-full max-w-[24px] rounded-t-[1px]"
                        style={{
                          height: `${18 + s.peak * 82}%`,
                          backgroundColor: `rgb(${accent.accent})`,
                          opacity: 0.55 + s.peak * 0.45,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 h-px w-full bg-paper/12" />
              </section>
            ) : null}

            {/* The archive */}
            <ul className="mt-14">
              <li className="grid grid-cols-12 gap-4 border-t border-paper/12 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-paper/35">
                <span className="col-span-3 sm:col-span-2">saved</span>
                <span className="col-span-9 sm:col-span-6">the week</span>
                <span className="hidden sm:col-span-3 sm:block">the turn</span>
                <span className="hidden sm:col-span-1 sm:block" />
              </li>
              {weeks.map((w, i) => {
                const accent = ACCENTS[w.narrative.tone] ?? ACCENTS.reflective;
                const turn = w.narrative.beats.find((b) => b.kind === "turning-point");
                return (
                  <motion.li
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.04, 0.4) }}
                    className="group grid grid-cols-12 items-baseline gap-4 border-t border-paper/12 py-6 last:border-b"
                  >
                    <span className="col-span-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-paper/45 sm:col-span-2">
                      {savedLabel(w.savedAt)}
                    </span>
                    <Link
                      href={`/story?s=${encodeNarrative(w.narrative)}`}
                      data-cursor="hover"
                      className="col-span-9 flex items-baseline gap-3 sm:col-span-6"
                    >
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: `rgb(${accent.accent})` }}
                      />
                      <span>
                        <span className="block font-display text-[clamp(1.3rem,2.6vw,2rem)] font-light leading-tight tracking-tight transition-transform duration-500 ease-arc group-hover:translate-x-1">
                          {w.narrative.title}
                        </span>
                        <span className="mt-1 block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-paper/40">
                          {w.narrative.period}
                        </span>
                      </span>
                    </Link>
                    <span className="col-span-9 col-start-4 font-body text-sm leading-snug text-paper/45 sm:col-span-3 sm:col-start-auto">
                      {turn?.headline ?? w.narrative.throughLine}
                    </span>
                    <span className="col-span-3 col-start-10 flex justify-end sm:col-span-1">
                      <button
                        onClick={() => remove(w.id)}
                        data-cursor="hover"
                        className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-paper/30 opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                        aria-label={`Remove ${w.narrative.title}`}
                      >
                        remove
                      </button>
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <footer className="grid grid-cols-2 gap-4 border-t border-paper/12 px-5 py-10 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-paper/40 sm:px-8 md:px-12">
        <span>Arc / your weeks</span>
        <span className="text-right">saved on this device</span>
      </footer>
    </main>
  );
}
