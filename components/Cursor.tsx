"use client";

import { useEffect, useRef } from "react";

// A subtle custom cursor: a small radius glow that follows the pointer and
// quietly grows over interactive elements. The native cursor is kept, this is
// additive. Hidden on touch and for reduced-motion users (handled in CSS).
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest(
        "a, button, textarea, input, [role='button'], [data-cursor='hover']",
      );
      el.dataset.hover = interactive ? "true" : "false";
    };

    const tick = () => {
      // Ease toward the pointer for a soft, trailing feel.
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };

    el.style.opacity = "1";
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="arc-cursor" style={{ opacity: 0 }} aria-hidden />;
}
