import type { Narrative } from "./types";

export interface DemoWeek {
  id: string;
  /** Short chip label on the landing page. */
  label: string;
  /** The messy raw input a user would paste. */
  input: string;
  /** The reliable baked reading — used as the demo-safe fallback. */
  narrative: Narrative;
  /** Distinctive substrings that identify this week in a pasted input. */
  signatures: string[];
}

// ── Week 1 — a week of avoidance (reflective · dusk · ink) ──────────────────
const REFLECTIVE_INPUT = `MON 10 Mar
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

const REFLECTIVE_NARRATIVE: Narrative = {
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

// ── Week 2 — a launch week (high-energy · coral · ink) ──────────────────────
const ENERGY_INPUT = `MON 17 Mar
02:14 — v2 is live. pushed it myself, hands shaking a bit from the coffee.
calendar: 09:00 standup / 10:00-17:00 back-to-back demos / 19:00 dinner (moved to the desk)
journal: shipped the thing we've been talking about for four months. it works. why do I feel nothing.

TUE 18 Mar
Product Hunt launch — #2 of the day by noon. refreshed it maybe 200 times.
calendar: 5 investor calls stacked. one soft yes. three "keep us posted".
voice note: "everyone keeps saying congrats and I keep saying 'we're just getting started' like a robot."

WED 19 Mar
08:00 gym (went, barely). 09:00 standup. spent the day on the hiring pipeline instead of sleep.
the second-engineer decision has been open three weeks. I keep re-reading the same two CVs.

THU 20 Mar
18:40 — sent the offer. she said yes within the hour.
journal: for the first time since we started, this isn't only mine to carry. I didn't know how heavy it was until it got a little lighter.

FRI 21 Mar
slept 4 hours, still buzzing. wrote the launch retro. told the team to take Monday off. didn't tell myself.
voice note: "the launch was the noise. the hire was the actual week."`;

const ENERGY_NARRATIVE: Narrative = {
  title: "The Hire Was the Week",
  period: "the week of 17 March",
  tone: "high-energy",
  throughLine:
    "You shipped more than most months, and the one thing that mattered was the thing that made it not only yours.",
  meta: { source: "cache" },
  beats: [
    {
      kind: "opening",
      headline: "You shipped more this week than most months — and almost none of it is what you'll remember.",
      body: "",
      fragments: [],
      kicker: "",
      intensity: 0.4,
    },
    {
      kind: "theme",
      kicker: "the blur",
      headline: "It ran from a 2am deploy to a 1am retro and never once slowed down.",
      body: "Back-to-back demos. A Product Hunt push to #2 by noon. Five investor calls stacked into a single Tuesday.",
      fragments: [],
      intensity: 0.6,
    },
    {
      kind: "texture",
      kicker: "the raw material",
      headline: "This is what the week clocked in as.",
      body: "",
      fragments: [
        "02:14 — v2 live, hands shaking a bit",
        "Product Hunt — #2 of the day by noon",
        "5 investor calls, one soft yes",
        "Thu 18:40 — the offer, sent",
        "Fri — 4 hours' sleep, still buzzing",
      ],
      intensity: 0.62,
    },
    {
      kind: "observation",
      kicker: "the honest part",
      headline: "Momentum is the easiest thing to mistake for progress.",
      body: "Most of what you shipped this week, you'll have forgotten by June. That's not failure — it's just not the point.",
      fragments: [],
      intensity: 0.5,
    },
    {
      kind: "turning-point",
      kicker: "Thursday, 18:40",
      headline: "You sent the offer, and for the first time this wasn't only yours to carry.",
      body: "She said yes within the hour. You didn't know how heavy the whole thing was until it got a little lighter.",
      fragments: [],
      intensity: 0.95,
    },
    {
      kind: "theme",
      kicker: "what actually changed",
      headline: "The load didn't get lighter. It got shared. That's a different kind of lighter.",
      body: "",
      fragments: [],
      intensity: 0.52,
    },
    {
      kind: "closing",
      headline: "The launch was the noise. The hire was the week.",
      body: "",
      fragments: [],
      kicker: "",
      intensity: 0.44,
    },
  ],
};

// ── Week 3 — a quiet beginning (growth · moss · paper) ──────────────────────
const GROWTH_INPUT = `MON 24 Mar
the running shoes have been by the door since January. stepped over them again.
journal: I keep saying "next week" like it's a real plan. it's been next week for two months.

TUE 25 Mar
06:10 — laced up before I could argue with myself. went out the door.
2.1km. walked half of it. lungs on fire. booked the next one before this one even ended.
journal: it was so much smaller than the dread. the dread was months. the run was nineteen minutes.

WED 26 Mar
didn't run. old me would've called that "failing." wrote down that I'd go Thursday instead. that's new.

THU 27 Mar
went again. slightly less on fire. saw the same guy walking his dog, we nodded. felt like a citizen of somewhere.

FRI 28 Mar
journal: I'm not a runner. I'm someone who ran twice this week. trying not to make it mean more than that, and not to let it mean less.
voice note: "turns out I didn't need motivation. I needed to make it smaller than the part of me that says no."`;

const GROWTH_NARRATIVE: Narrative = {
  title: "Someone Who Ran on Tuesday",
  period: "the week of 24 March",
  tone: "growth",
  throughLine:
    "After months of meaning to, you started — and the starting was smaller and quieter than the dread had promised.",
  meta: { source: "cache" },
  beats: [
    {
      kind: "opening",
      headline: "For months it was a someday. This week it became a Tuesday.",
      body: "",
      fragments: [],
      kicker: "",
      intensity: 0.32,
    },
    {
      kind: "theme",
      kicker: "the meaning-to",
      headline: "You'd been meaning to start so long that the meaning-to had become its own routine.",
      body: "The running shoes had been by the door since January. “Next week” had been next week for two months.",
      fragments: [],
      intensity: 0.42,
    },
    {
      kind: "texture",
      kicker: "the raw material",
      headline: "This is what the week was made of.",
      body: "",
      fragments: [
        "the shoes by the door since January",
        "“next week” — for two months",
        "Tue 06:10 — laced up anyway",
        "2.1km, walked half of it",
        "booked the next one before this one ended",
      ],
      intensity: 0.48,
    },
    {
      kind: "observation",
      kicker: "the honest part",
      headline: "You didn't need motivation. You needed to make it smaller than the part of you that says no.",
      body: "",
      fragments: [],
      intensity: 0.5,
    },
    {
      kind: "turning-point",
      kicker: "Tuesday, 06:10",
      headline: "You laced up and went out the door before the part of you that argues woke up.",
      body: "2.1km. You walked half of it. It was so much smaller than the dread — the dread was months, the run was nineteen minutes.",
      fragments: [],
      intensity: 0.9,
    },
    {
      kind: "theme",
      kicker: "what it started",
      headline: "One run isn't a habit. But it's the first data point that says the story could be different.",
      body: "",
      fragments: [],
      intensity: 0.46,
    },
    {
      kind: "closing",
      headline: "You're not a runner yet. You're someone who ran on Tuesday. That's the whole thing.",
      body: "",
      fragments: [],
      kicker: "",
      intensity: 0.4,
    },
  ],
};

export const DEMO_WEEKS: DemoWeek[] = [
  {
    id: "avoidance",
    label: "A week of avoidance",
    input: REFLECTIVE_INPUT,
    narrative: REFLECTIVE_NARRATIVE,
    signatures: ["investor update", "called mom", "forty minutes", "the dread is the tax"],
  },
  {
    id: "launch",
    label: "A launch week",
    input: ENERGY_INPUT,
    narrative: ENERGY_NARRATIVE,
    signatures: ["v2 is live", "product hunt", "sent the offer", "the hire was the actual week"],
  },
  {
    id: "beginning",
    label: "A quiet beginning",
    input: GROWTH_INPUT,
    narrative: GROWTH_NARRATIVE,
    signatures: ["running shoes have been by the door", "laced up", "2.1km", "someone who ran"],
  },
];

// Back-compat single-week exports (the first prepared week).
export const DEMO_INPUT = REFLECTIVE_INPUT;
export const DEMO_NARRATIVE = REFLECTIVE_NARRATIVE;

// Loose match so the reliable fallback triggers even after light edits on stage.
export function matchDemo(input: string): Narrative | null {
  const n = input.toLowerCase();
  for (const week of DEMO_WEEKS) {
    const hits = week.signatures.filter((s) => n.includes(s.toLowerCase())).length;
    if (hits >= 2) return week.narrative;
  }
  return null;
}
