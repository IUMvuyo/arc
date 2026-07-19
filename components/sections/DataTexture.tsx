"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Beat } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

// Data-as-texture: the raw material of the week, shown as a ledger of found
// scraps — not a chart, not a stat card. Atmosphere made of real fragments.
export function DataTexture({ beat }: { beat: Beat }) {
  const reduce = useReducedMotion();
  const fragments = beat.fragments ?? [];

  return (
    <section className="px-6 py-24 sm:px-10 md:px-16 md:py-28">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal variant="hold">
            {beat.kicker ? (
              <p className="font-body text-xs uppercase tracking-[0.3em] text-accent">
                {beat.kicker}
              </p>
            ) : null}
            <h2 className="mt-4 max-w-xs font-display text-[clamp(1.5rem,3vw,2.4rem)] font-light leading-tight tracking-tighter text-fg/80">
              {beat.headline}
            </h2>
          </Reveal>
        </div>

        <motion.ul
          className="space-y-4 border-l border-accent/25 pl-6 md:col-span-8 md:pl-10"
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ staggerChildren: 0.12 }}
        >
          {fragments.map((f, i) => (
            <motion.li
              key={i}
              className="flex items-baseline gap-4 font-body text-base text-fg/60 sm:text-lg"
              variants={{
                hidden: { opacity: 0, x: -14 },
                show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
              }}
            >
              <span className="mt-[0.55rem] h-px w-4 shrink-0 bg-accent/60" aria-hidden />
              <span className="leading-snug">{f}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
