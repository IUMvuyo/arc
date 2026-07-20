import type { ReactNode } from "react";

// The editorial label language: mono, uppercase, tracked, optionally indexed.
// Used for every piece of metadata so the whole system speaks one voice.
export function Label({
  index,
  children,
  className = "",
  tone = "accent",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
  tone?: "accent" | "muted" | "fg";
}) {
  const color =
    tone === "accent"
      ? "text-accent"
      : tone === "muted"
        ? "text-fg/40"
        : "text-fg/70";
  return (
    <span
      className={`inline-flex items-baseline gap-2 font-mono text-[0.7rem] uppercase tracking-[0.28em] ${color} ${className}`}
    >
      {index ? <span className="tabular-nums opacity-60">{index}</span> : null}
      <span>{children}</span>
    </span>
  );
}
