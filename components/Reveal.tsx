"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealVariant = "rise" | "unveil" | "settle" | "hold";

const VARIANTS: Record<RevealVariant, Variants> = {
  // Used sparingly, the plain translate-up.
  rise: {
    hidden: { opacity: 0, y: 34 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  },
  // A masked wipe from below, text unlocks rather than slides.
  unveil: {
    hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    show: {
      opacity: 1,
      clipPath: "inset(0 0 0% 0)",
      transition: { duration: 1.1, ease: EASE },
    },
  },
  // Eases in from very slightly enlarged, a camera settling on its subject.
  settle: {
    hidden: { opacity: 0, scale: 1.035 },
    show: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE } },
  },
  // Pure fade, for the quietest moments.
  hold: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 1.4, ease: EASE } },
  },
};

export function Reveal({
  children,
  variant = "rise",
  delay = 0,
  className,
  amount = 0.4,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const base = VARIANTS[variant];
  const withDelay: Variants = {
    hidden: base.hidden,
    show: {
      ...base.show,
      transition: { ...(base.show as any).transition, delay },
    },
  };

  return (
    <motion.div
      className={className}
      variants={withDelay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

// Word-by-word stagger for headlines, a distinct entrance from block reveals.
export function RevealWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.045, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-baseline" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: { duration: 0.8, ease: EASE } },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// A hairline that draws itself horizontally on entry.
export function HairRule({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`h-px w-full origin-left bg-accent/40 ${className}`}
      initial={reduce ? undefined : { scaleX: 0 }}
      whileInView={reduce ? undefined : { scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1, ease: EASE, delay }}
    />
  );
}
