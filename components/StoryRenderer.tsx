import type { GeneratedStory } from "@/lib/types";
import { TitleCard } from "@/components/sections/TitleCard";
import { OpeningStatement } from "@/components/sections/OpeningStatement";
import { ThemeSection } from "@/components/sections/ThemeSection";
import { DataTexture } from "@/components/sections/DataTexture";
import { PullLine } from "@/components/sections/PullLine";
import { Diptych } from "@/components/sections/Diptych";
import { TurningPoint } from "@/components/sections/TurningPoint";
import { Observation } from "@/components/sections/Observation";
import { WeekShape } from "@/components/sections/WeekShape";
import { ClosingLine } from "@/components/sections/ClosingLine";

// The generation pass, rendered. The accent + canvas are the only things that
// vary structurally between stories; everything else is composed from the beats
// GPT-5.6 produced, in the order it produced them.
export function StoryRenderer({ story }: { story: GeneratedStory }) {
  const { narrative, accent, canvas } = story;
  const fg = canvas === "ink" ? "250 250 247" : "14 14 16";

  const items: { id: string; node: React.ReactNode }[] = [
    {
      id: "beat-title",
      node: <TitleCard title={narrative.title} period={narrative.period} />,
    },
  ];
  let themeCount = 0;

  narrative.beats.forEach((beat, i) => {
    // The data-derived shape lands just before the arc resolves.
    if (beat.kind === "closing") {
      items.push({
        id: "beat-shape",
        node: (
          <WeekShape
            beats={narrative.beats}
            turningPointIndex={story.turningPointIndex}
            shape={story.shape}
          />
        ),
      });
    }

    let node: React.ReactNode = null;
    switch (beat.kind) {
      case "opening":
        node = <OpeningStatement beat={beat} period={narrative.period} />;
        break;
      case "theme":
        themeCount += 1;
        node = <ThemeSection beat={beat} index={themeCount} />;
        break;
      case "texture":
        node = <DataTexture beat={beat} />;
        break;
      case "pull-line":
        node = <PullLine beat={beat} />;
        break;
      case "diptych":
        node = <Diptych beat={beat} />;
        break;
      case "turning-point":
        node = <TurningPoint beat={beat} shape={story.shape} />;
        break;
      case "observation":
        node = <Observation beat={beat} />;
        break;
      case "closing":
        node = <ClosingLine beat={beat} period={narrative.period} />;
        break;
    }
    items.push({ id: `beat-${i}`, node });
  });

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
      {items.map((it) => (
        <div key={it.id} id={it.id}>
          {it.node}
        </div>
      ))}
    </main>
  );
}
