import type { GeneratedStory } from "@/lib/types";
import { OpeningStatement } from "@/components/sections/OpeningStatement";
import { ThemeSection } from "@/components/sections/ThemeSection";
import { DataTexture } from "@/components/sections/DataTexture";
import { TurningPoint } from "@/components/sections/TurningPoint";
import { Observation } from "@/components/sections/Observation";
import { ClosingLine } from "@/components/sections/ClosingLine";

// The generation pass, rendered. The accent + canvas are the only things that
// vary structurally between stories; everything else is composed from the beats
// GPT-5.6 produced, in the order it produced them.
export function StoryRenderer({ story }: { story: GeneratedStory }) {
  const { narrative, accent, canvas } = story;
  const fg = canvas === "ink" ? "250 250 247" : "14 14 16";

  let themeCount = 0;

  return (
    <main
      className={`grain relative min-h-screen ${
        canvas === "ink" ? "bg-ink" : "bg-paper"
      }`}
      style={
        {
          "--accent": accent.accent,
          "--accent-soft": accent.accentSoft,
          "--fg": fg,
          color: `rgb(${fg})`,
        } as React.CSSProperties
      }
    >
      {narrative.beats.map((beat, i) => {
        switch (beat.kind) {
          case "opening":
            return (
              <OpeningStatement key={i} beat={beat} period={narrative.period} />
            );
          case "theme":
            themeCount += 1;
            return <ThemeSection key={i} beat={beat} index={themeCount} />;
          case "texture":
            return <DataTexture key={i} beat={beat} />;
          case "turning-point":
            return <TurningPoint key={i} beat={beat} shape={story.shape} />;
          case "observation":
            return <Observation key={i} beat={beat} />;
          case "closing":
            return (
              <ClosingLine key={i} beat={beat} period={narrative.period} />
            );
          default:
            return null;
        }
      })}
    </main>
  );
}
