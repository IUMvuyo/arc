import type { Beat } from "@/lib/types";
import { RevealWords, HairRule, Reveal } from "@/components/Reveal";

// The opening statement. One true sentence, held at full-bleed monumental scale.
// The first frame of the film.
export function OpeningStatement({
  beat,
  period,
}: {
  beat: Beat;
  period: string;
}) {
  return (
    <section className="relative flex min-h-screen flex-col justify-between px-6 pb-14 pt-28 sm:px-10 md:px-16">
      <div className="flex items-center justify-between">
        <Reveal variant="hold">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent">
            {period}
          </span>
        </Reveal>
        <Reveal variant="hold" delay={0.2}>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-fg/40">
            00 / opening
          </span>
        </Reveal>
      </div>

      <div className="max-w-[64rem]">
        <h1 className="font-display text-[clamp(2.6rem,8.5vw,7.5rem)] font-light leading-[0.94] tracking-tightest text-fg">
          <RevealWords text={beat.headline} />
        </h1>
        <HairRule className="mt-10 max-w-[22rem]" delay={0.4} />
      </div>

      <Reveal variant="hold" delay={0.6}>
        <div className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-fg/50">
          <span className="inline-block h-8 w-px animate-pulse bg-fg/40" />
          scroll
        </div>
      </Reveal>
    </section>
  );
}
