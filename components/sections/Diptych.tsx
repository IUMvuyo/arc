"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Beat } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

// Two statements in tension, set against each other across a dividing line:
// what you said you would do, and what you did. The gap between them is the point.
export function Diptych({ beat }: { beat: Beat }) {
  const reduce = useReducedMotion();
  const [left, right] = beat.fragments ?? [];
  if (!left || !right) return null;

  return (
    <section className="px-6 py-24 sm:px-10 md:px-16 md:py-32">
      {beat.headline ? (
        <Reveal variant="hold">
          <p className="mb-14 max-w-reading font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
            {beat.headline}
          </p>
        </Reveal>
      ) : null}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-0">
        <motion.div
          className="md:pr-12"
          initial={reduce ? undefined : { opacity: 0, x: -18 }}
          whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <span className="mb-5 block font-mono text-[0.66rem] uppercase tracking-[0.24em] text-fg/35">
            what you said
          </span>
          <p className="font-display text-[clamp(1.5rem,3.2vw,2.6rem)] font-light leading-tight tracking-tight text-fg/50">
            {left}
          </p>
        </motion.div>
        <motion.div
          className="border-t border-accent/40 pt-10 md:border-l md:border-t-0 md:pl-12 md:pt-0"
          initial={reduce ? undefined : { opacity: 0, x: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        >
          <span className="mb-5 block font-mono text-[0.66rem] uppercase tracking-[0.24em] text-accent">
            what you did
          </span>
          <p className="font-display text-[clamp(1.5rem,3.2vw,2.6rem)] font-light leading-tight tracking-tight text-fg">
            {right}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
