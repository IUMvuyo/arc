// Turn an uploaded file into pasteable week text. Calendar exports (.ics) become
// readable lines; markdown/text/json pass through. Everything runs client-side —
// nothing is uploaded anywhere.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function unescapeICS(s: string): string {
  return s
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function formatICSDate(raw?: string): string {
  if (!raw) return "";
  const m = raw.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return raw;
  const [, , mo, d, hh, mm] = m;
  const day = `${parseInt(d, 10)} ${MONTHS[parseInt(mo, 10) - 1] ?? mo}`;
  return hh ? `${day} ${hh}:${mm}` : day;
}

/** Parse an iCalendar export into a readable, time-ordered list of events. */
export function parseICS(text: string): string {
  // RFC 5545: unfold continuation lines (they begin with a space or tab).
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  type Ev = { start?: string; summary?: string };
  const events: Ev[] = [];
  let cur: Ev | null = null;

  for (const line of lines) {
    if (/^BEGIN:VEVENT/i.test(line)) cur = {};
    else if (/^END:VEVENT/i.test(line)) {
      if (cur && (cur.summary || cur.start)) events.push(cur);
      cur = null;
    } else if (cur) {
      if (/^DTSTART/i.test(line)) cur.start = line.split(":").slice(1).join(":");
      else if (/^SUMMARY/i.test(line)) cur.summary = unescapeICS(line.split(":").slice(1).join(":"));
    }
  }

  if (!events.length) return text; // not an ICS we understood — hand it back raw
  events.sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
  return events
    .map((e) => `${formatICSDate(e.start)} — ${e.summary ?? "(untitled)"}`)
    .join("\n");
}

function jsonToLines(obj: unknown): string {
  if (Array.isArray(obj)) {
    return obj
      .map((item) => {
        if (item && typeof item === "object") {
          return Object.entries(item as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(" · ");
        }
        return String(item);
      })
      .join("\n");
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join("\n");
  }
  return String(obj);
}

/** Normalize an uploaded file's contents into week text, keyed off its extension. */
export function normalizeUpload(filename: string, text: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".ics")) return parseICS(text);
  if (lower.endsWith(".json")) {
    try {
      return jsonToLines(JSON.parse(text));
    } catch {
      return text;
    }
  }
  return text;
}
