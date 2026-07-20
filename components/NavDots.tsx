"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeneratedStory, BeatKind } from "@/lib/types";

const KIND_LABEL: Record<BeatKind, string> = {
  opening: "the opening",
  theme: "a thread",
  texture: "the material",
  "pull-line": "a line",
  diptych: "the tension",
  "turning-point": "the turn",
  observation: "a note",
  closing: "the close",
};

// Scrollytelling nav — one dot per section, tracking the beat in view. Click to
// travel. Hidden on small screens and for reduced-motion users.
export function NavDots({ story }: { story: GeneratedStory }) {
  const items = useMemo(() => {
    const out: { id: string; label: string }[] = [{ id: "beat-title", label: "title" }];
    story.narrative.beats.forEach((b, i) => {
      if (b.kind === "closing") out.push({ id: "beat-shape", label: "the shape" });
      out.push({ id: `beat-${i}`, label: b.kicker?.trim() || KIND_LABEL[b.kind] });
    });
    return out;
  }, [story]);

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  activeRef.current = active;

  // Keyboard travel between sections.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      let next: number | null = null;
      if (["ArrowDown", "ArrowRight", "j"].includes(e.key)) {
        next = Math.min(items.length - 1, activeRef.current + 1);
      } else if (["ArrowUp", "ArrowLeft", "k"].includes(e.key)) {
        next = Math.max(0, activeRef.current - 1);
      }
      if (next !== null) {
        e.preventDefault();
        document.getElementById(items[next].id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items]);

  useEffect(() => {
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best = 0;
        let bestRatio = -1;
        items.forEach((it, i) => {
          const r = ratios.get(it.id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = i;
          }
        });
        setActive(best);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -20% 0px" },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  const chrome = story.canvas === "ink" ? "250 250 247" : "14 14 16";

  return (
    <nav
      aria-label="Story sections"
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex"
      style={{ color: `rgb(${chrome})` }}
    >
      {items.map((it, i) => {
        const isActive = i === active;
        return (
          <button
            key={it.id}
            onClick={() =>
              document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth" })
            }
            className="group pointer-events-auto flex items-center gap-3"
            data-cursor="hover"
            aria-label={`Go to ${it.label}`}
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className="whitespace-nowrap font-body text-[0.65rem] uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-60"
            >
              {it.label}
            </span>
            <span
              className="block rounded-full transition-all duration-500 ease-arc"
              style={{
                width: isActive ? 22 : 6,
                height: 6,
                backgroundColor: isActive
                  ? "rgb(var(--accent))"
                  : `rgb(${chrome} / 0.3)`,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
