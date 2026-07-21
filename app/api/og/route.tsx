import { ImageResponse } from "next/og";
import { ACCENTS } from "@/lib/palette";
import type { Tone } from "@/lib/types";

export const runtime = "nodejs";

// A branded social preview card, personalized by the week's title and tone.
// Rendered with the default font so it never fails on a missing typeface.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("t") || "A week, read by Arc").slice(0, 80);
  const tone = (searchParams.get("k") || "reflective") as Tone;
  const pair = ACCENTS[tone] ?? ACCENTS.reflective;
  const accent = `rgb(${pair.accent})`;
  const ink = "#0E0E10";
  const paper = "#FAFAF7";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: ink,
          padding: "72px",
          color: paper,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "rgba(250,250,247,0.55)" }}>
          <span style={{ fontWeight: 700 }}>Arc</span>
          <span>a site built from your week</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 120, height: 8, background: accent, marginBottom: 40 }} />
          <div style={{ fontSize: 92, lineHeight: 1.02, fontWeight: 300, maxWidth: 980, letterSpacing: -2 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "rgba(250,250,247,0.5)" }}>
          <span>GPT-5.6 reads / the engine builds</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span>{tone}</span>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: accent }} />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
