"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import type { GeneratedStory, Narrative } from "@/lib/types";
import { generateStory } from "@/lib/generator";
import { encodeNarrative, decodeNarrative } from "@/lib/share";
import { saveWeek, hasWeek } from "@/lib/archive";
import { syncWeekUp } from "@/lib/cloud";
import { StoryRenderer } from "@/components/StoryRenderer";
import { NavDots } from "@/components/NavDots";

const SOURCE_LABEL: Record<string, string> = {
  cache: "demo reading",
  heuristic: "local reading",
};

// Known non-model sources get a phrase; any model id renders as "read by <id>".
function sourceLabel(source?: string): string {
  if (!source) return "";
  return SOURCE_LABEL[source] ?? `read by ${source}`;
}

export function StoryClient({ shared }: { shared?: string }) {
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [current, setCurrent] = useState<Narrative | null>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // A shared link carries the whole narrative in the URL. Otherwise read the
    // one this browser just generated. Either way, publish a shareable URL.
    try {
      let narrative: Narrative | null = shared ? decodeNarrative(shared) : null;
      const fresh = !shared;
      if (!narrative) {
        const raw = sessionStorage.getItem("arc:narrative");
        narrative = raw ? (JSON.parse(raw) as Narrative) : null;
      }
      if (!narrative) {
        setMissing(true);
        return;
      }
      setStory(generateStory(narrative));
      setCurrent(narrative);
      window.scrollTo(0, 0);

      if (fresh) {
        // A week you just built. Publish a permalink and save it to your archive
        // (and to the cloud if you are signed in).
        const url = `${window.location.pathname}?s=${encodeNarrative(narrative)}`;
        window.history.replaceState(null, "", url);
        const entry = saveWeek(narrative, Date.now());
        void syncWeekUp(entry);
        setSaved(true);
      } else {
        // A shared or example link: offer to keep it, note if it is already saved.
        setSaved(hasWeek(narrative));
      }
    } catch {
      setMissing(true);
    }
  }, [shared]);

  function keep() {
    if (!current) return;
    const entry = saveWeek(current, Date.now());
    void syncWeekUp(entry);
    setSaved(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (missing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
        <p className="font-display text-2xl font-light tracking-tight">
          No week loaded yet.
        </p>
        <Link
          href="/"
          className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-accent underline-offset-4 hover:underline"
        >
          Start from your week →
        </Link>
      </main>
    );
  }

  if (!story) {
    return <div className="min-h-screen bg-ink" />;
  }

  const chrome = story.canvas === "ink" ? "250 250 247" : "14 14 16";

  return (
    <div className="relative">
      {/* Light scroll chrome. Not a signature moment, just orientation. */}
      <motion.div
        className="fixed left-0 top-0 z-40 h-0.5 w-full origin-left bg-accent"
        style={{ scaleX: scrollYProgress }}
      />

      <div
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 font-mono text-[0.7rem] uppercase tracking-[0.24em] sm:px-10 md:px-16"
        style={{ color: `rgb(${chrome} / 0.5)` }}
      >
        <Link href="/" className="hover:opacity-100" data-cursor="hover">
          Arc /
        </Link>
        <div className="flex items-center gap-5">
          <span className="hidden sm:inline">
            {sourceLabel(story.narrative.meta?.source)}
          </span>
          {saved ? (
            <Link
              href="/weeks"
              data-cursor="hover"
              className="hidden uppercase tracking-[0.24em] transition-opacity hover:opacity-100 sm:inline"
            >
              in your weeks ↗
            </Link>
          ) : (
            <button
              onClick={keep}
              data-cursor="hover"
              className="hidden uppercase tracking-[0.24em] transition-opacity hover:opacity-100 sm:inline"
            >
              keep this +
            </button>
          )}
          <button
            onClick={copyLink}
            data-cursor="hover"
            className="uppercase tracking-[0.24em] transition-opacity hover:opacity-100"
            style={{ color: "rgb(var(--accent))" }}
          >
            {copied ? "link copied" : "share →"}
          </button>
        </div>
      </div>

      <NavDots story={story} />

      <StoryRenderer story={story} />

      <div
        className="flex flex-col items-center justify-center gap-5 py-16"
        style={{ backgroundColor: story.canvas === "ink" ? "#0E0E10" : "#FAFAF7" }}
      >
        <button
          onClick={copyLink}
          data-cursor="hover"
          className="font-mono text-xs uppercase tracking-[0.24em] text-accent underline-offset-4 hover:underline"
        >
          {copied ? "link copied" : "share this site →"}
        </button>
        <div className="flex items-center gap-6">
          <Link
            href="/weeks"
            onClick={() => {
              if (!saved) keep();
            }}
            className="font-mono text-xs uppercase tracking-[0.24em] underline-offset-4 hover:underline"
            data-cursor="hover"
            style={{ color: `rgb(${chrome} / 0.45)` }}
          >
            {saved ? "your weeks →" : "keep + your weeks →"}
          </Link>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.24em] underline-offset-4 hover:underline"
            data-cursor="hover"
            style={{ color: `rgb(${chrome} / 0.45)` }}
          >
            Build another week →
          </Link>
        </div>
      </div>
    </div>
  );
}
