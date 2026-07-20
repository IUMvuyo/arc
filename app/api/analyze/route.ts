import { NextResponse } from "next/server";
import { analyzeWeek, inputError } from "@/lib/analyze";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let input = "";
  try {
    const body = await req.json();
    input = typeof body?.input === "string" ? body.input : "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const bad = inputError(input);
  if (bad) return NextResponse.json({ error: bad }, { status: 422 });

  const narrative = await analyzeWeek(input);
  return NextResponse.json({ narrative });
}
