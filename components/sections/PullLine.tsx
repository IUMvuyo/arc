import type { Beat } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

// A single towering line, held alone at full-bleed. A realization that earns the
// whole viewport. The second-loudest type after the turning point.
export function PullLine({ beat }: { beat: Beat }) {
  return (
    <section className="flex min-h-[85vh] items-center px-6 py-24 sm:px-10 md:px-16">
      <div className="max-w-[60rem]">
        {beat.kicker ? (
          <Reveal variant="hold">
            <p className="mb-8 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent">
              {beat.kicker}
            </p>
          </Reveal>
        ) : null}
        <Reveal variant="unveil">
          <p className="font-display text-[clamp(2rem,5.5vw,4.6rem)] font-light leading-[1.02] tracking-tightest text-fg">
            {beat.headline}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
