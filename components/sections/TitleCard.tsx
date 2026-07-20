import { Reveal } from "@/components/Reveal";

// The cold open. A film title: the evocative title GPT-5.6 wrote for the week,
// held alone before the story begins.
export function TitleCard({ title, period }: { title: string; period: string }) {
  return (
    <section className="relative flex min-h-screen flex-col justify-between px-6 py-14 sm:px-10 md:px-16">
      <div className="flex items-center justify-between">
        <Reveal variant="hold">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent">
            a reading of {period}
          </span>
        </Reveal>
        <Reveal variant="hold" delay={0.2}>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-fg/40">
            Arc
          </span>
        </Reveal>
      </div>

      <div className="flex flex-1 items-center">
        <Reveal variant="settle" delay={0.2}>
          <h1 className="max-w-[16ch] font-display text-[clamp(2.6rem,9vw,8rem)] font-light leading-[0.92] tracking-tightest text-fg">
            {title}
          </h1>
        </Reveal>
      </div>

      <Reveal variant="hold" delay={1}>
        <div className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-fg/50">
          <span className="inline-block h-8 w-px animate-pulse bg-fg/40" />
          begin
        </div>
      </Reveal>
    </section>
  );
}
