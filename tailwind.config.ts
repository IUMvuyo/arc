import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Constant across every generated site — never a variable.
        ink: "#0E0E10",
        paper: "#FAFAF7",
        // The one variable: set per-story on the story root as a CSS var.
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        // Foreground — flips with the canvas (paper on ink, ink on paper).
        fg: "rgb(var(--fg) / <alpha-value>)",
      },
      fontFamily: {
        // Wired in app/layout.tsx via next/font (variable axes).
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.055em",
        tighter: "-0.04em",
      },
      maxWidth: {
        stage: "72rem",
        reading: "38rem",
      },
      transitionTimingFunction: {
        // Deliberate, cinematic — no bounce.
        arc: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
