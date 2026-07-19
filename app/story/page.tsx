"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import type { GeneratedStory, Narrative } from "@/lib/types";
import { generateStory } from "@/lib/generator";
import { StoryRenderer } from "@/components/StoryRenderer";
import { NavDots } from "@/components/NavDots";

const SOURCE_LABEL: Record<string, string> = {
  "gpt-5.6": "read by gpt-5.6",
  cache: "demo reading",
  heuristic: "local reading",
};

export default function StoryPage() {
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [missing, setMissing] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("arc:narrative");
      if (!raw) {
        setMissing(true);
        return;
      }
      const narrative = JSON.parse(raw) as Narrative;
      setStory(generateStory(narrative));
      window.scrollTo(0, 0);
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
        <p className="font-display text-2xl font-light tracking-tight">
          No week loaded yet.
        </p>
        <Link
          href="/"
          className="mt-6 font-body text-sm uppercase tracking-[0.25em] text-accent underline-offset-4 hover:underline"
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
      {/* Light scroll chrome — not a signature moment, just orientation. */}
      <motion.div
        className="fixed left-0 top-0 z-40 h-0.5 w-full origin-left bg-accent"
        style={{ scaleX: scrollYProgress }}
      />

      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 font-body text-xs uppercase tracking-[0.25em] sm:px-10 md:px-16"
        style={{ color: `rgb(${chrome} / 0.5)` }}
      >
        <Link href="/" className="pointer-events-auto hover:opacity-100" data-cursor="hover">
          Arc /
        </Link>
        <span>{SOURCE_LABEL[story.narrative.meta?.source ?? ""] ?? ""}</span>
      </div>

      <NavDots story={story} />

      <StoryRenderer story={story} />

      <div
        className="flex items-center justify-center gap-6 py-16"
        style={{
          backgroundColor: story.canvas === "ink" ? "#0E0E10" : "#FAFAF7",
        }}
      >
        <Link
          href="/"
          className="font-body text-sm uppercase tracking-[0.25em] text-accent underline-offset-4 hover:underline"
          data-cursor="hover"
        >
          Build another week →
        </Link>
      </div>
    </div>
  );
}
