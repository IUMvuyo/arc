import { analyzeWeek, inputError } from "@/lib/analyze";

export const runtime = "nodejs";
export const maxDuration = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Streams the reading as it assembles: the through-line first, then each beat as
// it's "discovered", then the full narrative. GPT-5.6 runs server-side; the
// staged emit gives the client a live "watch it think" reveal that works the
// same whether the reading came from the model or the demo-safe fallback.
export async function POST(req: Request) {
  let input = "";
  try {
    const body = await req.json();
    input = typeof body?.input === "string" ? body.input : "";
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const bad = inputError(input);
  if (bad) return new Response(bad, { status: 422 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        const narrative = await analyzeWeek(input);

        send({
          type: "through-line",
          value: narrative.throughLine,
          tone: narrative.tone,
          title: narrative.title,
          source: narrative.meta?.source ?? "cache",
        });
        await sleep(650);

        for (const beat of narrative.beats) {
          send({
            type: "beat",
            kind: beat.kind,
            kicker: beat.kicker ?? "",
            headline: beat.headline,
          });
          await sleep(300);
        }

        await sleep(200);
        send({ type: "narrative", value: narrative });
        send({ type: "done" });
      } catch {
        send({ type: "error", value: "Arc couldn't read that. Try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
