"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import type { Beat, StoryShape } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

// THE moment. The single kinetic-type beat: as the turning point enters view the
// display face physically gains mass — weight, optical size and softness climb —
// scaled to the emotional intensity GPT-5.6 detected here. Max one per site.
export function TurningPoint({
  beat,
  shape,
}: {
  beat: Beat;
  shape: StoryShape;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "center 0.4"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 });

  // The peak weight is the story's intensity, made physical.
  const peakWght = Math.round(320 + beat.intensity * 580); // up to ~900
  const wght = useTransform(p, [0, 1], [228, peakWght]);
  const opsz = useTransform(p, [0, 1], [14, 144]);
  const soft = useTransform(p, [0, 1], [0, 52]);
  const opacity = useTransform(p, [0, 1], [0.22, 1]);
  const fvs = useMotionTemplate`"opsz" ${opsz}, "SOFT" ${soft}, "wght" ${wght}`;

  const pivotal = shape === "pivotal";

  return (
    <section
      ref={ref}
      className={`relative flex flex-col justify-center px-6 sm:px-10 md:px-16 ${
        pivotal ? "min-h-[128vh] py-40" : "min-h-screen py-28"
      }`}
    >
      {/* The hard visual break — a full-bleed rule that draws across. */}
      {pivotal ? (
        <motion.div
          className="absolute left-0 top-0 h-px w-full origin-left bg-accent/50"
          initial={reduce ? undefined : { scaleX: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.3, ease: EASE }}
        />
      ) : null}

      {beat.kicker ? (
        <Reveal variant="hold">
          <p className="mb-10 font-body text-sm uppercase tracking-[0.4em] text-accent">
            {beat.kicker}
          </p>
        </Reveal>
      ) : null}

      <motion.h2
        className="font-display max-w-[68rem] leading-[0.98] tracking-tightest text-fg"
        style={
          reduce
            ? { fontVariationSettings: `"opsz" 144, "SOFT" 40, "wght" ${peakWght}` }
            : { fontVariationSettings: fvs, opacity }
        }
      >
        <span className="block text-[clamp(2.4rem,7vw,6.2rem)]">{beat.headline}</span>
      </motion.h2>

      {beat.body ? (
        <Reveal variant="rise" delay={0.2}>
          <p className="mt-12 max-w-reading font-body text-xl leading-relaxed text-fg/70">
            {beat.body}
          </p>
        </Reveal>
      ) : null}
    </section>
  );
}
