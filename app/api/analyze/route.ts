import { NextResponse } from "next/server";
import { analyzeWeek, inputError, AnalyzeError } from "@/lib/analyze";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let input = "";
  let image: string | undefined;
  let config: unknown;
  try {
    const body = await req.json();
    input = typeof body?.input === "string" ? body.input : "";
    image = typeof body?.image === "string" ? body.image : undefined;
    config = body?.config;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const bad = inputError(input, !!image);
  if (bad) return NextResponse.json({ error: bad }, { status: 422 });

  try {
    const narrative = await analyzeWeek(input, image, config);
    return NextResponse.json({ narrative });
  } catch (err) {
    const message = err instanceof AnalyzeError ? err.message : "Arc couldn't read that.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
