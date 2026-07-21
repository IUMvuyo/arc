import type { Narrative } from "./types";

// Encode a whole narrative into a URL-safe string so any generated site becomes
// a shareable permalink, with no backend and no database. Works in the browser
// and on the server (for social preview cards), using version-prefixed base64url.

const VERSION = "1";

function toBase64Url(str: string): string {
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(str, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window === "undefined"
    ? Buffer.from(b64, "base64").toString("utf-8")
    : decodeURIComponent(escape(atob(b64)));
}

export function encodeNarrative(narrative: Narrative): string {
  return VERSION + toBase64Url(JSON.stringify(narrative));
}

export function decodeNarrative(param: string): Narrative | null {
  try {
    if (!param) return null;
    const version = param.slice(0, 1);
    if (version !== VERSION) return null;
    const parsed = JSON.parse(fromBase64Url(param.slice(1))) as Narrative;
    if (!parsed || !Array.isArray(parsed.beats) || !parsed.beats.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

// A light, safe peek at just title + tone, used to personalize the social card
// without decoding or trusting the whole blob.
export function peekTitleTone(param: string): { title: string; tone: string } | null {
  const n = decodeNarrative(param);
  if (!n) return null;
  return { title: n.title ?? "", tone: n.tone ?? "reflective" };
}
