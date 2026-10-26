# Blackbird Leads

## What this is

A lead finder for Blackbird Coffee bookers. Blackbird sells B2B office coffee subscriptions in
Sweden and Denmark. A booker asks for leads, gets a verified call list (ringlista), checked against
Adversus, and can have the fresh leads entered into Adversus.

What makes a valid lead is defined in `REQUIREMENTS.md`. What to write in the Adversus note is
defined in `ADVERSUS-TEMPLATE.md`. Change those rules there, not in the skills. The design of the project
is in `MVP.md`.

## Skills

All skills are in `.claude/skills/`. Read the `SKILL.md` before using one.

- `lead-guide` shows what the booker can ask for.
- `lead-search` finds and verifies leads. Three modes: around one meeting, between two meetings,
  or a whole area. Country specifics live in `references/sweden.md` and `references/denmark.md`.
- `adversus-check` checks a list against Adversus. Read only.
- `adversus-entry` enters the fresh leads into an Adversus campaign.

## How to start

"I want more leads" or "what can you do": `lead-guide`. Each skill shows its own plan when it
starts.

## Folders

- `ringlistor/se/` Swedish lists, named `YYYY-MM-DD Ringlista <Ort>.md`.
- `ringlistor/dk/` Danish lists, named `YYYY-MM-DD Ringeliste <By>.md`.

Everything except the files listed in `.gitignore` stays local.

## Browser

Google Maps and Adversus are read through Claude in Chrome. If Chrome is not connected, say so and
stop. Never deliver a list that looks checked but was not.

## Rules

- Never invent a value. If it was not found on a page, write `ej hittad` (Swedish) or
  `ikke fundet` (Danish).
- Never place a call in Adversus. Never write to Adversus without the booker saying yes.
- Ask which booker is running the search the first time it matters (for `Save lead as` in
  Adversus). Do not assume a name.
- Do not use em dashes in anything you write.
- Keep it simple: KISS, less is more, just enough and no more.
- Keep this file as small as possible. It only points to where things live. Instructions,
  explanations and tables go in the skill or file they belong to.
