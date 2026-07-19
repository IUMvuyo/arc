import type { Beat } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

// One honest observation — the thing a perceptive friend would say. Held quiet
// and centred so it reads as an aside, not a headline competing with the arc.
export function Observation({ beat }: { beat: Beat }) {
  return (
    <section className="flex min-h-[70vh] items-center px-6 py-24 sm:px-10 md:px-16">
      <div className="mx-auto max-w-3xl text-center">
        {beat.kicker ? (
          <Reveal variant="hold">
            <p className="mb-8 font-body text-xs uppercase tracking-[0.35em] text-accent">
              {beat.kicker}
            </p>
          </Reveal>
        ) : null}
        <Reveal variant="settle">
          <p className="font-display text-[clamp(1.6rem,3.4vw,2.8rem)] font-light italic leading-[1.25] tracking-tight text-fg/90">
            {beat.headline}
          </p>
        </Reveal>
        {beat.body ? (
          <Reveal variant="hold" delay={0.2}>
            <p className="mx-auto mt-8 max-w-reading font-body text-base leading-relaxed text-fg/55">
              {beat.body}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
