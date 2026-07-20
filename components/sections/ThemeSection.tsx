import type { Beat } from "@/lib/types";
import { Reveal, HairRule } from "@/components/Reveal";

// A recurring thread. Editorial split: a small marker column against a wide
// column of type. Never a card. The grid is alignment infrastructure only.
export function ThemeSection({ beat, index }: { beat: Beat; index: number }) {
  const label = String(index).padStart(2, "0");
  return (
    <section className="px-6 py-24 sm:px-10 md:px-16 md:py-32">
      <HairRule className="mb-14 md:mb-20" />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-3">
          <Reveal variant="hold">
            <span className="font-mono text-2xl tabular-nums text-accent">{label}</span>
            {beat.kicker ? (
              <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-fg/50">
                {beat.kicker}
              </p>
            ) : null}
          </Reveal>
        </div>
        <div className="md:col-span-9">
          <Reveal variant="unveil">
            <h2 className="font-display text-[clamp(1.8rem,4.4vw,3.6rem)] font-light leading-[1.05] tracking-tighter">
              {beat.headline}
            </h2>
          </Reveal>
          {beat.body ? (
            <Reveal variant="hold" delay={0.15}>
              <p className="mt-7 max-w-reading font-body text-lg leading-relaxed text-fg/70">
                {beat.body}
              </p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
