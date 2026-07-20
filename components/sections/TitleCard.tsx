import { Reveal } from "@/components/Reveal";

// The cold open — a film title. The evocative title GPT-5.6 wrote for the week,
// held alone before the story begins.
export function TitleCard({ title, period }: { title: string; period: string }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Reveal variant="hold">
        <p className="font-body text-xs uppercase tracking-[0.4em] text-accent">
          {period}
        </p>
      </Reveal>
      <Reveal variant="settle" delay={0.3}>
        <h1 className="mt-8 max-w-[20ch] font-display text-[clamp(2.4rem,7vw,6rem)] font-light leading-[0.98] tracking-tightest text-fg">
          {title}
        </h1>
      </Reveal>
      <Reveal variant="hold" delay={1}>
        <span className="mt-14 block h-10 w-px animate-pulse bg-fg/30" />
      </Reveal>
    </section>
  );
}
