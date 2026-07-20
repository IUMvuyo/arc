import type { Beat } from "@/lib/types";
import { Reveal, HairRule } from "@/components/Reveal";

// The closing line. The arc resolved. Monumental again, but settled.
export function ClosingLine({
  beat,
  period,
}: {
  beat: Beat;
  period: string;
}) {
  return (
    <section className="flex min-h-screen flex-col justify-between px-6 pb-12 pt-32 sm:px-10 md:px-16">
      <div className="flex flex-1 items-center">
        <div className="max-w-[62rem]">
          <Reveal variant="settle">
            <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.6rem)] font-light leading-[1] tracking-tightest">
              {beat.headline}
            </h2>
          </Reveal>
          {beat.body ? (
            <Reveal variant="hold" delay={0.25}>
              <p className="mt-8 max-w-reading font-body text-lg leading-relaxed text-fg/65">
                {beat.body}
              </p>
            </Reveal>
          ) : null}
        </div>
      </div>

      <div>
        <HairRule className="mb-6" />
        <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.26em] text-fg/45">
          <span>Arc / built from {period}</span>
          <span>fin</span>
        </div>
      </div>
    </section>
  );
}
