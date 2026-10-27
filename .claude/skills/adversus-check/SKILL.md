---
name: adversus-check
description: "Check Swedish or Danish companies against the existing leads in Adversus through Claude in Chrome, so a booker never spends a dial on a company a colleague already worked, and so the untouched ones rise to the top of the list. Use this whenever the user asks whether a company or a list has already been called, wants a ringlista or ringeliste checked against the CRM, mentions Adversus, says anything like har vi ringt dem, ligger de redan i listan, er de i Adversus, har vi ringet til dem, check these against my leads, or hands over a list file, a pasted list of company names, or a single company name, organisationsnummer or CVR for a spot check. Use it inside lead-search too, right after the filter step and before contact research. Every company is looked up by company ID through Adversus' own search, misses by name, the call history of every hit is read without opening the dialer, and the result is one file with the leads nobody has worked on top and the already worked ones below with their Adversus status."
---

# Adversus check

## The job

A ringlista is a list of companies worth calling. It says nothing about whether a colleague
called them three weeks ago and got a no. This skill answers that one question, company by
company, and reorders the list so the untouched ones sit where the booker's eye lands first.

That is the whole scope. Do not score, re-rank on quality, enrich, or edit any lead in Adversus.
Read only.

The output is one file with two tables:

1. **Worth dialling now**, in two groups. **1a:** companies Adversus has never heard of. **1b:**
   companies that are in Adversus but that nobody has actually spoken to. These are the fresh dials.
2. **Already worked.** Companies with real call history, each carrying what the CRM says happened.

## Input

Three shapes, all the same work underneath:

- a list file in `ringlistor/se/` or `ringlistor/dk/`, which is the normal case
- a list of companies pasted into chat
- one company name, organisationsnummer or CVR, for a quick spot check

A list file is rewritten in place, keeping its name, so one area means one file. A pasted
list gets a new file at `ringlistor/se/<YYYY-MM-DD> Adversus-koll.md` or
`ringlistor/dk/<YYYY-MM-DD> Adversus-tjek.md`, date first like every other file in that folder. A
single company gets an answer in chat and no file, because a one line file is clutter.

## Tell the booker first

Run on its own, send one short message in English before any work:

- **What happens:** every company is looked up in Adversus, and the list is split into fresh
  leads on top and already worked ones below.
- **Your dialer: free, keep calling.** The check reads Adversus' own search in a background tab.
  It opens no lead page and no dialer view, saves nothing and never dials anyone.
- **Takes:** under a minute, plus writing the file.
- **You need:** Chrome logged in to Adversus.
- **You get:** the file path, and at the end a few questions about unclear matches.

Then start. Inside `lead-search`, its status lines for step 2 are enough. A spot check of one
company needs no plan.

At the end, say the real time. If it is far off, update the time here and in the `lead-guide`
menu.

## Country

Swedish and Danish companies sit in the same Adversus, in different campaigns. The company ID
format and the table language differ, so read the country file of the list before starting:
`../lead-search/references/sweden.md` or `../lead-search/references/denmark.md`. Everything
written below with a Swedish org.nr as the example works the same way for a Danish CVR, except
where it says otherwise.

## Before you touch anything

This skill cannot work without Adversus, and a list that quietly went unchecked looks exactly
like a checked one. Nobody downstream can tell the difference, which is why the failure has to be
loud.

So open `https://app.adversus.io/` in a new tab of your own and run the lookup there. Its first
call checks the login. If Chrome is not connected, the tab shows a login screen, or the script
answers `STOP`, **stop before doing anything else**. Tell the booker plainly that Adversus is not
reachable, ask them to sign in, and then wait. Never enter credentials. Do not start, do not half
start, do not deliver a partially checked list. Begin only once they confirm.

## The lookup

All lookups are done by `scripts/check.js`. It calls Adversus' internal search and timeline
endpoints from the logged-in tab, the same ones the web app uses. Read only: nothing is saved, no
lead page is opened, no call is placed. Tested on 2026-10-26: 715 Malmö companies in about 30 s
against about 4 hours through the search box, with 13 errors of the old method found and no case
where the old method was right and the script wrong.

Paste the whole file into `javascript_tool`, followed by one call with the list's rows in order:

```js
await bbCheck([['5565284329', 'Melleruds Färg AB'], ['', 'Bolaget Utan Orgnr AB']])
```

Each row is the company ID without the dash (`''` when it is `ej hittad` or `ikke fundet`) and
the name to search (see below). It answers with one summary line. Then read the rows with
`bbLines(0, 15)`, `bbLines(15, 30)` and so on, since `javascript_tool` truncates near 1000
characters. Each line gives the row index, the group (`1a`, `1b`, `2`), every lead found with id,
status, number of calls, longest call in seconds and date of the last call, and notes for the
uncertain batch.

What the script does, so the result can be read correctly:

1. **Company ID first, for every row,** digits without the dash, `5565284329`. Only a hit whose
   value is exactly those digits counts.
2. **Name only for rows the ID search missed,** in lowercase, because a capital Å, Ä or Ö at the
   start of a word never matches. The name search matches substrings (`ramo ab` also returns
   `Entramo AB`), so only an exact name counts, ignoring case. Near names come back as a note.

Two searches, and no third. The dashed organisationsnummer never matches (see below), so it is
skipped. There is no clever fragment that widens the net either, so a company that misses both has
missed.

**Denmark:** the same two searches: the eight CVR digits and the full name. Field `112622` is
called `CVR` in Adversus and holds Swedish org.nr too.

The name to search is the registered name in the `Företag` cell with any parenthetical trade name
removed. `AB Melleruds Bostäder (Mellbo)` goes in as `AB Melleruds Bostäder`, and
`Matglädje i Mellerud AB (Hemköp Torget)` goes in as `Matglädje i Mellerud AB`. The parenthetical
is the sign on the door, useful on the call and useless in the search box.

A hit on the company ID is proof of identity on its own. A hit on the name is an exact name, but
still goes in the uncertain batch with `found by name only`.

### What a miss actually proves

This is the part that decides whether the output can be trusted, so it is worth being precise
about.

**The dashed organisationsnummer never matches.** Adversus stores the digits unformatted, so
`556528-4329` returns nothing while `5565284329` returns the lead. That is why it is not searched.

**The name search is not a dependable text search.** Probed against four leads that were sitting
in the list at the time of writing:

| Searched | Result |
|---|---|
| `Melleruds` | 4 hits |
| `elleruds` | 4 hits |
| `Melleruds Färg AB` | 1 hit, exact |
| `Bostäder` | nothing, though `AB Melleruds Bostäder` is a lead |
| `Måleri` | nothing, though `Melleruds Måleri & Service Aktiebolag` is a lead |
| `Elektriska` | nothing, though `Nya Aktiebolaget Melleruds Elektriska Affär` is a lead |
| `Aktiebolag` | nothing, same lead |
| `Mel`, `Mell`, `Melle`, `Meller`, `Mellerud` | nothing |

Whole words that plainly sit inside leads it holds come back empty. So the name search can add a
hit but it can never establish an absence, and shortening a name to a fragment to "widen" the
search does the opposite of what it looks like it does. Search the full name, once.

Keep the name search all the same. In Malmö (715 companies) it found 16 leads the
organisationsnummer search missed, because those leads had no organisationsnummer stored. It also
returns unrelated companies whose name contains the searched one, which is why only an exact name
counts.

That leaves the organisationsnummer without the dash as the only identifier that produces a
trustworthy negative. Everything the output claims about a company not being in Adversus rests on
that one search, which is exactly why it is worth copying the digits carefully rather than
retyping them from memory.

Two consequences worth holding onto. A row with `ej hittad` in `Org.nr` (or `ikke fundet` in `CVR`) cannot be
cleared by a name search alone, so it belongs in the uncertain batch rather than in table 1. And
a false negative here is survivable: the booker dials someone already worked and finds out in the
first fifteen seconds. A false positive, a company wrongly parked in table 2, is worse, because
it is a lead silently never called. When the two risks pull against each other, lean towards
table 1.

## Reading a hit

The script reads the call history of every hit. The status alone cannot answer the question the
booker is really asking, which is not "what does the CRM say" but "has anyone actually spoken to
these people". The status can even disagree with the timeline (`Unprocessed` on a lead with real
calls).

Do not use the search's `contactAttempts` to skip a timeline. It is not a call count: in Malmö,
408 of 425 hits with `contactAttempts` 0 had calls.

Each call in the timeline carries its length in seconds, the same figure the lead page shows as
`Duration`. The date of the last call is `senast`. A planned callback date is never `senast`.

Adversus answers with Danish statuses. The script writes them in English, as the cell uses them:

| Adversus | Cell |
|---|---|
| `Succes` | `Success` |
| `Genopkald` | `Callback` |
| `Ukvalificeret` | `Unqualified` |
| `Ugyldigt` | `Invalid` |
| `Ikke interesseret` | `Not interested` |
| `Ubehandlet` | `Unprocessed` |
| `Aut. redial` | `Aut. redial` |

Any other status is kept as Adversus writes it and goes in the uncertain batch. When it is
resolved, add it to this table and to `STATUS` in `scripts/check.js`.

### Worked, or not

Read the timeline for calls and apply one rule:

**A company counts as worked if the timeline holds at least one call of twenty seconds or
longer.** Anything less has not been worked, whatever the status says.

Twenty seconds is the line because below it nothing was said. A thirteen second call is a
switchboard, a wrong number or a hangup, and three of those in a row still means nobody has had
the conversation. The number is deliberately in one place so it is easy to move: if the booker
wants it at thirty, this sentence is the only edit.

So:

- **No calls at all, or only calls under twenty seconds.** Not worked. The row goes in table 1
  alongside the companies Adversus has never heard of, carrying its status so the booker can see
  it does exist in the CRM.
- **At least one call of twenty seconds or more.** Worked. Table 2, with what happened.

An empty or unfamiliar status is not a reason to guess. Record it, put the row where the timeline
says it belongs, and raise the status in the uncertain batch at the end.

## If the API fails

The endpoints are undocumented and can change. If the script answers `STOP: API error`, nothing
it found is used. Tell the booker the check could not run, and deliver nothing as checked.

On the booker's yes, the slow manual way still works, one company at a time, ca 30 s each, and it
uses the dialer:

- The booker closes their own dialer first. Adversus allows only one. If a page shows "You have
  another dialer open", wait for them; do not click Retry.
- Search `https://app.adversus.io/dialer#/list/search-campaigns` with the `CVR` and `Firmanavn`
  chips: org.nr without dash, then the full name. Wait five seconds and check that the `Result`
  cell matches what you searched before using a row.
- Open each hit at `https://app.adversus.io/reactive-dialer?mode=edit&leadid=<id>` and read
  `Duration (\d+) sec` from the page text with `javascript_tool`. Timeline dates are MM/DD/YYYY.
- On that page touch nothing: not the green call button, not `Save lead`, not `Status`, not
  `Blocklist lead`. When done, navigate away and say `Dialer free, you can use Adversus again.`

## Output

Both tables keep the list's column set unchanged (defined in `lead-search` SKILL.md, Output), with
one column, `Adversus`, added directly after the company ID, because whether anyone has called
them is the first thing that decides the next action once you know which company you are looking
at.

What goes in the `Adversus` cell, in the list's language:

| Case | Swedish | Danish |
|---|---|---|
| No hit on any identifier | `Ej i Adversus` | `Ikke i Adversus` |
| A hit nobody has worked | `Unsolved, ej ringd (lead 1002024028)` | `Unsolved, ikke ringet (lead 1002024028)` |
| A worked lead | `Automatic callback, 4 samtal, senast 2026-07-07 (lead 1002024028)` | `Automatic callback, 4 opkald, senest 2026-07-07 (lead 1002024028)` |

The lead id is there so the booker can open the lead in one paste rather than searching for it
again.

**Table 1, `Värda att ringa nu` / `Værd at ringe til nu`.** Everything not worked, split in two
labelled tables so the booker can choose which to enter as callbacks (see `adversus-entry` Step 2):

- **1a, `Nya, ej i Adversus` / `Nye, ikke i Adversus`:** no hit on any identifier.
- **1b, `Finns i Adversus, ingen har pratat med dem` / `I Adversus, ingen har talt med dem`:** a hit
  with no call of 20 seconds or more. The `Adversus` cell carries status and lead id.

Each in the list's own order (nearest first, along the route, or by street). Do not reshuffle it,
since that order is still what decides which call to make next.

**Table 2, `Redan bearbetade` / `Allerede bearbejdet`.** Sorted so the live ones surface:
`Unsolved` and any callback status first, then the rest, and within each group in the list's own
order. A lead somebody abandoned
mid-session or parked for a callback is still in play and is worth a second run at. `Not
interested`, `Invalid` and `Unqualified` are settled, so they sink.

Under the tables, a few lines: how many companies were checked, how the split fell, which
identifier found each hit if that is interesting, and anything that had to be worked around.
Keep the ringlista's existing notes, they are still true.

## When something is unclear

Work through the whole list without stopping. Interrupting after every oddity turns a ten minute
job into a conversation, and most oddities read differently once the rest of the list is known.

Collect as you go:

- a name hit that might be a different company, two similar names, a branch office
- several hits for one company
- a status not on the list above
- a company you expected to find and did not
- a row with no organisationsnummer, where a clean negative is not available

When the run is finished, deliver the file, then put the uncertain cases in front of the booker
in one batch, each with what was searched, what came back, and what was assumed in the meantime.
Ask them to resolve it.

Then ask one more question: whether the same situation should be handled automatically next time.
If the answer is yes, edit this skill so it is. That is how the rule set grows out of real runs
rather than out of guesses, and it is why the uncertain batch is worth collecting properly rather
than papering over.

## Out of scope

Finding companies, verifying phone numbers and building the ringlista in the first place belong
to `lead-search`. Writing anything back to Adversus belongs to nothing here. This skill
reads the CRM and reorders a list, and that is all it should ever do.
