---
name: lead-search
description: "Build a verified call list (ringlista or ringeliste) of Swedish or Danish companies worth calling about Blackbird Coffee workplace coffee, delivered as a markdown table. Three modes: around one booked meeting (everything within 30 minutes' drive), between two booked meetings (everything along the route that adds only a short detour), or a whole area (a kommun, postort, industriområde, by or postnummer, no meeting needed). Use this whenever the user asks for leads, a call list, a ringlista, a ringeliste, prospects, nearby companies, who else to ring, companies between two meetings, or all companies in an area, or just pastes a company name, an address or two meetings. Registry sources are swept first, then Google Maps is read through the browser as a coverage check. Every row carries the number to dial, named contacts where they exist, the company ID, employee count, location and links to the source pages. The table is checked against Adversus with adversus-check before the file is saved, and the booker is then asked whether the fresh rows should be entered with adversus-entry. A request for more leads that names no place goes to lead-guide instead."
---

# Lead search

## The job

A Blackbird salesperson drives out, sets up a machine and lets the room taste the coffee. The
booker's job is to fill the salesperson's day with meetings that are close together. A row earns
its place only if the booker can dial it right now and the salesperson can physically get there.
A perfect company with no number is not a lead, it is homework.

Output: one markdown file in `ringlistor/se/` or `ringlistor/dk/`, and the same tables in the chat
reply. No long write-up, the table is the deliverable.

## Tell the booker first

Before any work, send this message in English, with the real values filled in.
Leave out anything that does not apply.

**<Mode and area>. <Number of leads> leads for <booker>.**

| Step | What happens | Time | Your dialer |
|---|---|---|---|
| 1 | Find companies | Mode 1: 15-30 min, mode 2: 20-40 min, mode 3: 30-60 min | Free |
| 2 | Check against Adversus | Under a minute | Free |
| 3 | Find contact people | 2-3 min per fresh lead | Free |
| 4 | Enter into Adversus (only if you say yes) | ca 1 min | **Closed** |

**Total:** time for the whole run, and how long the dialer is closed.
**You need:** Chrome logged in to Adversus.
**Before step 4:** Close your dialer. I tell you when, and when it is free again. Nothing gets dialled.
**You get:** what the list contains and where the leads end up.
**Questions:** every question for the whole run at once: mode or area if unclear, and the
`adversus-entry` questions (which rows, campaign, `Save lead as`).

Show only this run's times, with step 3 as a total. Do not repeat the plan as a paragraph. If the
app shows a recap box, write only: `Plan is ready, waiting for your answers.`

The answers are the go. Run the whole pipe without stopping and do not ask the same things again.

**As you go:** at the start of each step, one line with the step, what it does and how long. For
step 4, lead with the dialer, for example
`Step 4 of 4: CLOSE YOUR DIALER now, ca 1 min, I say when it is free. Entering 12 leads.`
When a dialer step ends, one line: `Dialer free, you can use Adversus again.`

**At the end:** the real time per step. If a step is far off, update its time in the skill it
belongs to and in the `lead-guide` menu.

## Name the chat

Once the area is known, rename the session to `Leads <Ort> <YYYY-MM-DD>`, for example
`Leads Helsingborg 2026-10-29`. In mode 2, use `Leads <Ort A>-<Ort B> <YYYY-MM-DD>`. If the
rename tool is not available, skip it.

## Before you start

1. **Pick the mode** from what the booker wrote (see the next section). If it is unclear, ask once.
2. **Pick the country** from the anchor or area. Then read exactly one of
   `references/sweden.md` or `references/denmark.md`. That file says which sources to use, what
   the company ID looks like, how phone numbers are written and which language the table is in.
   Everything in this file applies to both countries.
3. Read `REQUIREMENTS.md` in the project root. It defines what a valid lead is, and Step 4 applies
   it.
4. Read `references/target-customer.md`. It is short and it is what makes the "why Blackbird"
   column worth reading.

## The three modes

### Mode 1, around one meeting

Input: one anchor company or address, usually a company where a meeting is booked.

- Hard wall: **30 minutes' drive** from the anchor. Nothing crosses it.
- No target row count. Work outward and stop when the immediate area runs dry, not when you hit a
  number. A dense industrial estate can give twenty, a rural anchor four. Below about five rows,
  keep going outward.
- Sort nearest first.

### Mode 2, between two meetings

Input: meeting A and meeting B, in that order. Times are useful but not required.

- A lead qualifies when the **detour** is at most **15 minutes**: drive A to lead, plus lead to B,
  minus the direct drive A to B.
- Build the pool from three places: the ring around A, the ring around B, and the towns and
  business areas the road from A to B passes through. Open the A to B route in Google Maps once to
  see which road the salesperson actually takes and which places it passes.
- Sort along the route: by drive time from A, so the list reads in driving order.
- If the booker gave meeting times, put the free time between them in the notes (gap minus direct
  drive). If it is under an hour, say so, since only one or two visits fit.

### Mode 3, area

Input: a kommun, postort, industriområde, by or postnummer. No meeting. If the booker did not
name the area, ask for it before starting.

- Stay inside the area. No drive time limit, since there is no anchor.
- Cap at **50 rows in table 1** (fresh leads after the Adversus check). A whole town has
  thousands of companies, and a list nobody finishes is not better than one they do. Stop
  sweeping once table 1 has 50 rows.
- Work the densest business areas first (industrial estates, business parks, the centre), then
  the rest.
- A large area (a whole city) is split into postnummer zones and run with subagents, see below.
- Sort grouped by street or estate, groups in an order a salesperson could drive, so a day can be
  planned on foot from a parking spot.
- In the notes, write exactly which streets, estates or postnummer were covered and which were
  not reached, so the next run can continue where this one stopped.

## Large areas, subagents

Tested on all of Malmö (2026-10-16). Use it when one agent would need more than about an hour.

- **Split by postnummer, not area names.** Give each agent an exact postnummer list. Area names
  overlap and agents waste fetches deciding the edges.
- **One brief file, short prompts.** Write the rules once to a brief file and point each agent at
  it with its batch. The brief carries the never-invent rule, the return format and "read only".
- **Model: Sonnet** for registry sweeps. The Adversus check needs no agent, `adversus-check`
  does a whole list in seconds. Usage, not speed, is the limit:
  Opus agents hit the session limit fast. TODO: do one test run with Haiku on the same batch and
  compare against Sonnet. Check whether Haiku misses hits, misreads digits or drifts from the rules.
- **Save every 10 rows** to the agent's result file, and resume from it. A run can stop at any
  moment (usage limit, logout), and anything not on disk is lost.
- **Browser agents get their own tab.** Several agents can use Claude in Chrome at once. Each
  closes its tab when done.
- **Before an unattended or scheduled run, check the Adversus login.** If it shows a login page,
  stop and ask the booker. Never enter credentials.
- Fresh small agents for a remainder are cheaper than resuming agents with a long history.
- Raw pages saved for parsing are deleted when the run is done.

## Step 1, pin the location

Resolve every input (anchor, A and B, or the area) to a real place: street address, postnummer and
town, or the exact area boundary. The country file says where to look.

If a name matches several companies or places, ask which one before spending effort. A wrong
anchor makes every drive time wrong, and that error is invisible in the output.

## Step 2, build the candidate pool from registries

Work outward from the anchor or through the area, because proximity is the scarcest thing:

1. The same street and the same industrial estate. Best leads of the day: drive time near zero,
   and the anchor contact often knows the neighbours. "Ring the place next door, they are bigger
   than us" is a pattern, not a one-off.
2. The rest of that industrial area or business park.
3. Other business areas in the same municipality.
4. (Mode 1 and 2 only) Neighbouring municipalities, as far as the limit reaches.

Use the registry and directory sources in the country file. Listings by postnummer or street are
the highest yield, because they enumerate an area rather than making you guess names.

**Sweden: start with the script.**
`& scripts/sweep-allabolag.ps1 -Query <kommun or postnummer list> -Kommun <kommun list> -Out <pool.csv>`
lists every company with 3 to 50 employees, largest first, with org.nr, address, phone and a `Flag`
for konkurs, likvidation, fusion and churches. A kommun name as query covers the whole kommun
without guessing postnummer; `-Kommun` drops the companies elsewhere that match the name. Tested on
Simrishamn and Tomelilla (2026-10-27): 372 companies in about a minute.

Gather generously before filtering. Step 4 and 5 drop many candidates, and going back for more is
slower than casting wide once.

Tag every candidate with where it was found, as you go. Reconstructing it at the end is guessing.

## Step 3, check coverage with Google Maps

Run this every time, after the registry sweep has run dry. Registries tell you who is
*registered* at an address, directories who *paid to be listed*, Google Maps who *physically
exists* there. None contains the others. In a real run on a dense Göteborg estate, Maps surfaced
seventeen businesses no registry had, and six survived the filter, two of them on the anchor's
own street.

**If Chrome is not connected,** stop and tell the booker before writing anything: what is missing,
that the list would go out with unchecked coverage, and ask whether to wait or proceed. Never
quietly deliver a registry-only list.

How to read an area:

1. Open `https://www.google.com/maps/place/<street address>` and take lat/lon from the URL once
   it resolves (about 5 seconds; read the URL from the tab list). Never guess coordinates. Use a
   street address inside the area, never an area name: area names often fall back silently to a
   generic city centre (Malmö: `/place//@55.6129313,13.0107681`) or to the wrong place.
2. On the anchor's place page, read the panel listing other businesses at the same address. These
   are the people the salesperson will walk past.
3. Search `https://www.google.com/maps/search/<term>/@<lat>,<lon>,16z` and read the results with
   `get_page_text`, not screenshots. Name, category, address and phone come in one read.
4. Results stop at about 15 per search. Move the centre about 600 metres and repeat. Stop an area
   when a search gives 2 or fewer new names. In mode 2, step along the route.
5. Vary the search term in mixed areas. The country file lists good terms. Ignore sponsored hits,
   they repeat in every search. Restaurant cards in the list show no phone; open the place page
   if the number matters.
6. Note which addresses are office hotels or coworking spaces. Their tenants are dropped.

A Maps hit is a name worth investigating, not a verified row. Maps has no company ID, no employee
count and no status, and it keeps cards for closed businesses. Everything from Maps goes through
Step 4 to 6 like any other candidate.

**Match Maps names to the registry by script.** Maps shows the sign on the door, the registry the
legal name, so most pairs do not look alike. Save the Maps hits (`Namn`, `Adress`) and the registry
pool (`Foretag`, `Orgnr`, `Adress`) as CSV and run
`powershell -File scripts/match-registry.ps1 -Maps <maps.csv> -Registry <pool.csv> -Out <out.csv> -Town <town>`.

- `sure, name`: take the org.nr.
- `sure, address and name word` and `candidate`: check each pair yourself. These are a short list.
- `none` or an address with many companies: a Maps-only name, handled as before.

Tested on Malmö: 91 of 383 Maps names matched in 4 s, against 60 by agents before.

Run the scripts in `scripts/` with the PowerShell tool. Started from Bash, Windows blocks them.

Close the tabs you opened.

## Step 4, drop what does not belong

Apply `REQUIREMENTS.md`: keep a candidate only if it meets every must have and none of the
exclusions. That file is the single source of truth for what a valid lead is, so do not add or
loosen rules here. If a real case does not fit the file, note it under the table and ask the booker
whether `REQUIREMENTS.md` should change.

The country file lists the local name signs for paper entities and the local sole trader form.

The registry employee figure is for the whole company, not the site. A high band across several
sites can still be a well sized site. Say so in the row rather than guessing.

**Size does not rank leads.** Inside 3 to 50 employees, a small company counts the same as a big one.
Never cut the pool or pick rows by size (booker's instruction, 2026-10-30).

## Step 5, check against Adversus

Run the `adversus-check` skill on the filtered candidates, before any contact research. In a
worked area most companies are already in Adversus: in Malmö 62% had a real conversation. Checking
first means Step 6 is only spent on rows that will land in table 1.

Rows that come back worked go to table 2 with their registry data and Adversus status. They get no
contact research. If Adversus cannot be reached, that skill stops and asks the booker to open it.

Table 1 is written as two labelled groups, because the booker decides about them separately:

- **1a, new:** not in Adversus at all.
- **1b, in Adversus, no conversation:** a lead exists but its timeline has no call of 20 seconds or
  more. The `Adversus` cell carries status and lead id, so `adversus-entry` can open it directly.

Both groups are equally worth dialling and get the same treatment in Step 6. Do not skip 1b because
it already exists: the research is what reaches the person who dials.

## Step 6, fill the row (table 1a and 1b)

**Registry pages** give the registered name, company ID, registered address and employee band.

**The company's own website** gives everything human: what they do, who to ask for, direct
numbers, the switchboard, the contact page URL.

**Sweden: hitta first.** Save the fresh rows' org.nr as CSV (`Orgnr`) and run
`& scripts/hitta.ps1 -In <rows.csv> -Out <hitta.csv> -Lat <anchor lat> -Lon <anchor lon>`. It gives
each company's phones and website from hitta.se, and in mode 1 the straight-line km from the anchor
(road is about 1.3 times it). Sort by it and research the nearest rows first. `Title` carries the
dashed org.nr, so check it matches the row. Leave out `-Lat` and `-Lon` in mode 3.

**Then the websites.** Save the rows' websites as CSV (`Name`, `Url`) and run
`powershell -File scripts/get-site-contacts.ps1 -In <sites.csv> -Out <found.csv>`. It reads each
home page and up to 3 linked contact or about pages and lists every phone number and email on
them, with no model. Tested on Värnamo: the number to dial was among them for 34 of 37 sites.
Then open only the page that shows those numbers, to pair names with numbers and pick the one to
dial. A site that comes back with no number goes to the browser (see JavaScript pages below).

**Who to ask for.** Not the registered director by default. At a small company that is a legal
fact, not the person who decides about coffee or picks up the phone. Take names from the site's
about, contact, team or staff page. Chase it properly: small companies publish leaders with direct
numbers more often than expected, and a direct line is the difference between getting through and
dying at a switchboard. If the site lists several people with numbers, include them all. If the
site names nobody, the registered director may go in the contact cell, marked as "according to the
registry, no direct number" in the table's language.

**Search finds pages, fetches read them.** Search summaries pair real numbers with the wrong names
and get employee counts a digit off. Use search to locate the page, then fetch it and copy the
values off the page itself.

**JavaScript pages.** A contact page that fetches empty or as boilerplate is a signal to open it in
the browser, not a sign that there is no phone number.

**Obfuscated email.** If a fetch shows `[email protected]` or an encoded link, that is not found.
Open the browser if it matters. Never rebuild an address from the pattern of colleagues' addresses.

## Step 7, drive times

| Mode | What goes in the drive column |
|---|---|
| 1 | Drive distance and time from the anchor |
| 2 | Drive from A, drive to B, and the detour |
| 3 | Nothing, the column is left out |

Estimate first, from the road distance:

- built-up area, door to door, about 30 km/h
- mixed road, about 50 km/h
- mostly motorway, about 80 km/h

Write estimates with `ca`, for example `14 km, ca 20 min`.

Check the real figure in Google Maps only where it decides whether a row lives:

- Mode 1: estimates between 22 and 38 minutes.
- Mode 2: detours between 10 and 20 minutes. Use a directions URL with the lead as a waypoint.

Drop `ca` on checked figures, so a checked number and an estimate never look the same.

**Mode 2, every row in table 1:** read the real km and minutes from A to the lead and from the lead
to B, from the Google Maps route with the lead as waypoint. They go in the drive column and in the
note's `🚗` part (see `ADVERSUS-TEMPLATE.md`), so they are never estimates.

## Step 8, reread before you write

Compare every company ID and every phone number against the page it came from, digit by digit. A
transcription slip looks exactly like fabrication once it is in a CRM. In the Malmö run an agent
wrote 559590-0791 for 556590-0791.

Do this by script where you can: fetch the raw page and compare the digits in code. A model reading
a page, or a fetch tool that summarizes it, can change a digit without anyone noticing.

Then run `powershell -File scripts/digits.ps1 <list file>` on the finished file (Sweden). It checks
every org.nr with the Luhn checksum and every phone number for shape, in about a second. Every
flagged value goes back to its source page. Fix it from the page, never by adjusting digits until
the check passes.

Check the link columns too. A contact source URL that does not show that person is worse than an
empty cell, because it looks like evidence.

## Output

### File name

| Mode | Sweden | Denmark |
|---|---|---|
| 1 | `ringlistor/se/YYYY-MM-DD Ringlista <Ort>.md` | `ringlistor/dk/YYYY-MM-DD Ringeliste <By>.md` |
| 2 | `ringlistor/se/YYYY-MM-DD Ringlista <A>-<B>.md` | `ringlistor/dk/YYYY-MM-DD Ringeliste <A>-<B>.md` |
| 3 | `ringlistor/se/YYYY-MM-DD Ringlista <Område>.md` | `ringlistor/dk/YYYY-MM-DD Ringeliste <Område>.md` |

Date first, so the folder sorts itself and the newest list is always last.

### Header line

First line under the title says the mode and the input: the anchor with address, or A and B with
times, or the area and its boundary.

### Columns

Headers are in the table's language. Order runs from what the booker needs while the phone is
ringing to what they need afterwards.

| Role | Swedish header | Danish header |
|---|---|---|
| Company name | Företag | Virksomhed |
| Company ID | Org.nr | CVR |
| Adversus status (added by adversus-check) | Adversus | Adversus |
| Category, 2 or 3 words | Typ | Type |
| Website, as a markdown link | Webbplats | Hjemmeside |
| How the lead was found | Källa lead | Kilde lead |
| The one number to dial | Nummer att ringa | Nummer at ringe |
| Contacts and other numbers | Kontaktperson | Kontaktperson |
| Page the contact came from | Källa kontakt | Kilde kontakt |
| Employees | Anställda | Ansatte |
| What they do | Vad de gör | Hvad de laver |
| Why Blackbird | Varför Blackbird | Hvorfor Blackbird |
| Address | Adress | Adresse |
| Drive (mode 1) | Körsträcka från ankaret | Køretid fra ankeret |
| Drive (mode 2) | Från A, till B, omväg | Fra A, til B, omvej |
| Map link | Google Maps | Google Maps |
| Email | E-post | E-mail |

Column notes:

- **Number to dial** is one number: the direct line if found, otherwise the switchboard marked
  `(växel)` or `(omstilling)`. Every other verified number goes in the contacts cell: owner or CEO
  first, then others, then the switchboard if it is not already the number to dial.
- **Källa lead / Kilde lead** has two values: `Register` when the company was in any registry or
  directory source, and **`Endast Maps`** / **`Kun Maps`** (bold) when you looked in those sources
  and it was not there. Set the second only after actually looking. For the booker it means a
  competitor working from a registry list does not have that row.
- **Website** is a markdown link with the bare domain as label: `[gigant.se](https://gigant.se)`.
- **Google Maps link:**
  - Mode 1: directions from the anchor,
    `https://www.google.com/maps/dir/?api=1&origin=<anchor>&destination=<lead>`
  - Mode 2: route A to B through the lead,
    `https://www.google.com/maps/dir/?api=1&origin=<A>&destination=<B>&waypoints=<lead>`
  - Mode 3: a pin, `https://www.google.com/maps/search/?api=1&query=<lead address>`
- **Why Blackbird** is one concrete sentence about this company, from something you learned.
  "Growing company with nice offices" is filler. "Workshop and showroom, staff and walk-in customers
  share one filter brewer by the counter" tells the booker how to open the call.
- Use `<br>` for several people in one cell, keeping each name next to its number.
- Every cell you could not verify says `ej hittad` / `ikke fundet`. Never blank.

Sort as the mode says, within each table. Step 5 decides the split into table 1a, table 1b and
table 2, in that order in the file.

### Notes under the tables

A few lines: where the file is, how many rows, how far the search reached (mode 3: which streets
or postnummer were covered and which were not), what was dropped and why, and the coverage result:
how many rows are `Register` and how many Maps only, and name the Maps only survivors. If the Maps
check could not run, say so in plain words.

## Step 9, offer to enter the list into Adversus

If the booker already answered this at the start, skip the question and run `adversus-entry` with
that answer. Otherwise, after the tables, ask one question, in the table's language, with the row
count of each group:

> Vill du att jag lägger in dem i Adversus som private callbacks? (a) bara nya (1a, N st), (b) bara befintliga utan samtal (1b, N st), (c) båda

> Skal jeg lægge dem ind i Adversus som private callbacks? (a) kun nye (1a, N stk), (b) kun eksisterende uden samtale (1b, N stk), (c) begge

Then stop. On an answer, run `adversus-entry` with that choice: it creates the 1a rows and refreshes
the 1b rows, and asks for campaign and rows itself. On no, the run is done. Never offer table 2.

## The rule that outranks everything above

A gap is a visible problem. An invented value is an invisible one. If the ID cell says not found,
the booker works around it. If it says a number you composed, it goes into the CRM, a salesperson
dials a stranger, and nobody traces it back.

Three values are dangerous because they have a shape you can produce from nothing:

- **Company ID.** Copy it off a fetched page where the company name matches your row. Never adjust
  a digit to pass a checksum. A valid checksum proves a string is well formed, not that it belongs
  to this company.
- **Phone number.** Copy it off the company's site or a directory page you fetched. Never carry one
  across from a similarly named company.
- **Email.** Write an address only when you have seen that exact string on a page.

The tell is the thought "it's almost certainly". When you notice it, write not found.

## Out of scope

Writing the call, objection handling, lead scoring and revenue figures. Writing to Adversus belongs
to `adversus-entry`.
