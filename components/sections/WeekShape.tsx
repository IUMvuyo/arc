"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Beat, StoryShape } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

// A quiet, data-derived interstitial: the intensity GPT-5.6 read in each beat,
// drawn as a seismograph of the week. Not a chart. No axes, no numbers, one
// colour, just the felt shape of the days. Proof the site comes from structure.
export function WeekShape({
  beats,
  turningPointIndex,
  shape,
}: {
  beats: Beat[];
  turningPointIndex: number;
  shape: StoryShape;
}) {
  const reduce = useReducedMotion();
  const caption =
    shape === "pivotal"
      ? "One day carried the rest of it."
      : "A level week. No single day ran away with it.";

  return (
    <section className="px-6 py-24 sm:px-10 md:px-16 md:py-28">
      <p className="mb-10 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent">
        the shape of the week
      </p>

      <div className="flex h-40 items-end gap-2 sm:gap-3" aria-hidden>
        {beats.map((beat, i) => {
          const isPeak = i === turningPointIndex;
          const height = `${12 + beat.intensity * 88}%`;
          return (
            <motion.div
              key={i}
              className="w-full max-w-[42px] rounded-t-[1px]"
              style={{ backgroundColor: isPeak ? "rgb(var(--accent))" : "rgb(var(--accent) / 0.28)" }}
              initial={reduce ? undefined : { height: 0, opacity: 0 }}
              whileInView={reduce ? { height } : { height, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : i * 0.08 }}
            />
          );
        })}
      </div>

      <div className="mt-6 h-px w-full bg-fg/15" />
      <p className="mt-6 max-w-reading font-mono text-sm leading-relaxed text-fg/55">
        {caption}
      </p>
    </section>
  );
}
