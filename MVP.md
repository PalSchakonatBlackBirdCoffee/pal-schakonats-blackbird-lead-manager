# Blackbird lead finder, MVP suggestion

## Goal

One standalone Claude Code project for Blackbird bookers that finds verified leads, checks them
against Adversus and enters the fresh ones. It has three search modes and a separate playbook for
each country.

It is built from the skills in the original Blackbird Coffee project (`blackbird-lead-search`,
`blackbird-adversus-check`, `blackbird-adversus-entry`). The MVP keeps the proven parts as they are
and only adds what is new: the modes and the country split.

## Folder layout

```
blackbird-leads/
  CLAUDE.md                     what the project is, the rules, how to start a search
  REQUIREMENTS.md               what makes a valid lead (3-50 employees, exclusions)
  ADVERSUS-TEMPLATE.md          what to write in the Adversus note
  MVP.md                        this file
  .claude/skills/
    lead-search/
      SKILL.md                  one skill, three modes, shared steps
      references/
        target-customer.md      why Blackbird sells to this segment
        sweden.md               Swedish sources, ID format, column headers, Adversus mapping
        denmark.md              Danish sources, ID format, column headers, Adversus mapping
    adversus-check/SKILL.md     copied, made country aware
    adversus-entry/SKILL.md     copied, made country aware
  ringlistor/
    se/                         YYYY-MM-DD Ringlista <Ort>.md
    dk/                         YYYY-MM-DD Ringeliste <By>.md
```

KISS: one search skill with modes, not three skills. The steps after "find candidates" (filter,
fill the row, reread, Adversus check, offer entry) are the same in every mode, so they live in one
place.

## The three modes

| Mode | Input | Which leads qualify | Sort order |
|---|---|---|---|
| **1. Runt ett möte** | One anchor company or address | Drive time from the anchor at or under 30 min | Nearest first |
| **2. Mellan två möten** | Meeting A and meeting B, in that order | Extra drive (A to lead to B, minus A to B) at or under X min | Along the route, A to B |
| **3. Område** | Kommun, postort, industriområde or postnummer | Inside the area, nothing else | Grouped by street or estate, so a salesperson can work it on foot |

Notes:

- **Mode 1** is today's skill, unchanged.
- **Mode 2** is new. The candidate pool is built from the towns and estates along the road
  between A and B, plus the ring around each meeting. The table gets one extra column, `Omväg`,
  and drive times are checked in Google Maps for anything close to the limit, just like today.
- **Mode 3** drops the drive time column and the directions link changes from "from the anchor"
  to a plain map link. It needs a cap, since an area like "Göteborg" has thousands of companies.
  Suggestion: stop at 50 rows, which is the cap already used on Ekerö.

## The country split

The shared SKILL.md says *what* to do. Each country file says *how* to do it there. Claude picks
the country from the anchor or the area and reads that file only.

| | Sweden (`sweden.md`) | Denmark (`denmark.md`) |
|---|---|---|
| Company ID | Organisationsnummer, `NNNNNN-NNNN`, in Adversus without the dash | CVR, 8 digits |
| Registry | allabolag.se, ratsit.se (street pages), bolagsfakta.se | datacvr.virk.dk, proff.dk |
| Directories | hitta.se, eniro.se | krak.dk, degulesider.dk |
| Coverage check | Google Maps, same method as today | Google Maps, same method |
| Phone format | Area code, `08-560 387 00` | 8 digits, no area code, `86 12 34 56` |
| Headers and notes | Swedish | Danish (to confirm) |
| Adversus Country field | `Sweden` | `Denmark` |
| Campaigns | Göteborg nord, Centrum/South, East, Stockholm Vest and others | Aarhus and others (to list) |

`sweden.md` is mostly a move of what is already written. `denmark.md` starts thin and is filled in
from real runs, the same way the Adversus check grows through its "uncertain batch" question at
the end of each run.

## What stays exactly as it is

- The hard rule: never invent an org number, phone number or email. `ej hittad` beats a guess.
- Contact person from the company's own site, not from the registry.
- Maps coverage check every run, and a loud stop if the browser is not connected.
- Adversus check before the file is written, two tables, the 20 second "worked" rule.
- The closing question about entering table 1 into Adversus, and the entry skill asking for
  campaign and rows before writing.

## Out of the MVP (later, if needed)

- Lead scoring or ranking beyond distance.
- Revenue or financial data.
- Scheduled or automatic runs.
- Any CRM other than Adversus.
- Norway and Finland.

## Build order

1. Create the folder, `CLAUDE.md`, and copy the three skills and `target-customer.md` in.
2. Move the Swedish specifics out of `SKILL.md` into `sweden.md`. Run mode 1 on a known area and
   compare with an existing ringlista. It should come out the same.
3. Add mode 3 (area). It is the simplest new mode, since it is mode 1 without the drive limit.
4. Add mode 2 (between two meetings).
5. Write `denmark.md` and make the Adversus skills read the country (ID format, Country field,
   campaign list). First Danish run on Aarhus, then fix `denmark.md` from what went wrong.

## Open questions

1. **Mode 2 limit.** How many extra minutes of driving is acceptable for a lead between two
   meetings? 10 min? 15 min?
2. **Mode 3 cap.** Is 50 rows right for an area search, or should it ask each time?
3. **Danish output.** Are the Danish lists read by Danish bookers, so headers and notes should be
   in Danish? And which Adversus campaigns do Danish leads go into?
4. **Danish target profile.** Is it the same 4 to 50 band and same competitor list, or does the
   Danish market differ (for example other competitors to drop)?
5. **Users.** Is this only for you, or for other bookers too? If others, `CLAUDE.md` needs a short
   "how to start" section and the booker's name for `Save lead as` must be asked, not hardcoded.
