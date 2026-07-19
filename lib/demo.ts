import type { Narrative } from "./types";

// One fully-prepared demo input: a real, specific, honest week — messy, human,
// with a genuine turning point. This is what reliably produces a great result
// on camera, and what the analysis falls back to if the network/key is absent.
export const DEMO_INPUT = `MON 10 Mar
06:40 — awake before the alarm again, couldn't get back down.
calendar: 09:00 standup / 11:00 investor update (moved, again) / 14:00 1:1 Thabo / 19:30 gym (skipped)
journal: told myself I'd call mom this weekend and didn't. she replied "ok" to my last message which means she is not ok.
shipped the export bug fix. 3 days late. nobody noticed it was late, which somehow feels worse.

TUE 11 Mar
calendar: 08:30 school run / 10:00 deep-work block (kept saying yes to Slack instead) / 22:30 back at laptop
voice note (transcribed): "it's 1am. i keep opening the doc to write the fundraise email and closing it. it's not the email. i know it's not the email."
goals doc (untouched since Feb): 1) ship v2  2) hire a second eng  3) actually rest one day a week
ate lunch at the desk again. six days straight now.

WED 12 Mar
07:00 gym — went. first time in two weeks.
13:00 lunch w/ Sipho — cancelled by me. "too much on." then spent that hour refreshing analytics.
the investor update is four days overdue. every day I don't send it, it gets heavier.

THU 13 Mar
09:15 — finally sent the investor update. it took 40 minutes. it had been sitting on me for a week.
14:00 — called mom. wasn't planning to. saw her name and just did it before I could talk myself out of it. talked for an hour. she's fine. I was the one who wasn't.
journal: the two things I was most avoiding took a hundred minutes combined. I gave them a week of dread each.

FRI 14 Mar
calendar: 09:00 standup / 11:00 1:1 Thabo (told him I'm hiring) / 16:00 walked instead of the gym
journal: slept seven hours. wrote the hiring post. said no to a Saturday meeting without a paragraph of apology.
voice note: "the dread is the tax, not the task. the task is always forty minutes."`;

// The baked reading of the demo input. Used verbatim as the reliable fallback,
// and as the fixture the analysis prompt is tuned against.
export const DEMO_NARRATIVE: Narrative = {
  title: "The Dread Was the Tax",
  period: "the week of 10 March",
  tone: "reflective",
  throughLine:
    "You spent a whole week paying interest on two conversations that each took under an hour.",
  meta: { source: "cache" },
  beats: [
    {
      kind: "opening",
      headline:
        "For most of this week, the hardest things you did were the things you didn't do.",
      body: "",
      fragments: [],
      kicker: "",
      intensity: 0.34,
    },
    {
      kind: "theme",
      kicker: "the pattern",
      headline: "You kept the document open and the call unmade.",
      body: "The fundraise email got opened and closed, opened and closed. Lunch was at the desk six days running. You cancelled on a friend and spent the hour you freed up refreshing analytics.",
      fragments: [],
      intensity: 0.46,
    },
    {
      kind: "texture",
      kicker: "the raw material",
      headline: "This is what the week was actually made of.",
      body: "",
      fragments: [
        "06:40 — awake before the alarm, again",
        "1am: “it's not the email. i know it's not the email.”",
        "lunch w/ Sipho — cancelled by me",
        "goals doc — untouched since Feb",
        "the investor update — 4 days overdue, then 5, then 6",
        "six lunches at the desk",
      ],
      intensity: 0.52,
    },
    {
      kind: "observation",
      kicker: "the honest part",
      headline:
        "Refreshing analytics during the hour you cancelled on a friend — the honesty of that isn't lost on you.",
      body: "You weren't out of time. You were avoiding, and staying busy was the disguise.",
      fragments: [],
      intensity: 0.58,
    },
    {
      kind: "turning-point",
      kicker: "Thursday, 14:00",
      headline: "You saw her name and called before you could talk yourself out of it.",
      body: "You weren't planning to. You talked for an hour. She's fine. You were the one who wasn't.",
      fragments: [],
      intensity: 0.96,
    },
    {
      kind: "theme",
      kicker: "the day after",
      headline: "Two things you dreaded for a week took a hundred minutes combined.",
      body: "The investor update took forty of them. You had given each of these a full week of dread, up front, in advance.",
      fragments: [],
      intensity: 0.5,
    },
    {
      kind: "closing",
      headline: "The dread was the tax. The task was always forty minutes.",
      body: "",
      fragments: [],
      kicker: "",
      intensity: 0.4,
    },
  ],
};

// Loose match so the reliable fallback triggers even after light edits on stage.
export function looksLikeDemo(input: string): boolean {
  const n = input.toLowerCase();
  return (
    n.includes("investor update") &&
    n.includes("called mom") &&
    n.includes("forty minutes")
  ) || n.includes("the dread is the tax");
}
