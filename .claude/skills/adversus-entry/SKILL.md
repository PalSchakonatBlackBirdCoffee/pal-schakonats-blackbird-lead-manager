---
name: adversus-entry
description: "Put the untouched leads from a Swedish ringlista or Danish ringeliste into an Adversus campaign as private callbacks, through Adversus' own API from a logged-in Claude in Chrome tab (the dialer page is the fallback), so the booker can start dialling them without typing anything. Two kinds of rows: new companies (table 1a) are created, and companies already in Adversus that nobody has spoken to (table 1b) are refreshed with a note and a callback. Use this whenever the user wants leads added, created, entered or imported into Adversus, wants existing leads put on callback, says lägg in leads, lägg in listan, skapa leads, sätt callback, læg dem ind, add these to Adversus, put them in the dialer, or hands over a list file and asks for it to be entered. Use it as the closing offer of lead-search too, after the file is written. The booker picks new, existing or both, then the campaign and the rows, before anything is written. Rows in table 2 (real conversations) are never touched. Every lead gets the number to dial, the contact people in the note, and a private callback in 5 minutes with status Callback, and every lead is read back out of the CRM afterwards to prove it landed."
---

# Adversus entry

## Country

Read the country file of the list before starting: `../lead-search/references/sweden.md` or
`../lead-search/references/denmark.md`, for the known campaign ids. The note format for both
countries is in `ADVERSUS-TEMPLATE.md` in the project root. The steps below use Sweden as the
example and work the same way for Denmark.

On the first Danish entry, open one existing lead in the chosen Danish campaign before typing
anything, match its field shape, and update the Denmark column in Step 4.

## The job

A ringlista is finished and checked. Table 1 holds the companies nobody in the team has worked, in
two groups:

- **1a, new:** not in Adversus. Until they exist there they are a markdown file, and a markdown
  file cannot be dialled. They are created.
- **1b, in Adversus, no conversation:** the lead exists but nobody has had a call of 20 seconds or
  more. They are refreshed: note, private callback, status Callback (see "Refreshing a lead" below).

Both end up the same way: a private callback in the booker's queue with the research in the note.
This skill does that one lead at a time, and then proves each one arrived.

That is the whole scope. This skill writes leads and nothing else. It does not find companies,
does not verify phone numbers, does not decide whether a company is worth calling, and touches an
existing lead only in the narrow way "Refreshing a lead" describes. The rest belongs to
`lead-search` and `adversus-check`.

## What it must never do

- **Never enter a row from table 2.** Those companies are already in the CRM. Adding them again
  creates the duplicate problem the Adversus check exists to prevent, and a duplicate is worse
  than a missing lead because two bookers ring the same company without seeing each other. It
  has happened in this campaign before.
- **Never place a call.** `scripts/entry.js` only calls `sessions/create`, `sessions/createForLead`
  and `sessions/<id>/close`, the same requests the `Save lead` button sends. Never call the
  `dial`, `call` or `hangup` endpoints. On the page fallback the green call button is one click
  away from a real phone ringing: fill fields, click `Save lead`, nothing else.
- **Never overwrite an existing lead's company data.** If a search turns up a company that is
  already there, its Firmanavn, CVR, address and employee fields stay as they are. Adversus makes
  most of them read-only on an existing lead anyway, which is the CRM agreeing with this rule.
  The one thing you may do to an existing lead is described under "Refreshing a lead that exists
  but was never dialled" below, and only for 1b rows the booker picked in Step 2.
- **Never invent a field value.** See the last section.

## Tell the booker first

Run on its own, send one short message in English before any work:

- **What happens:** the chosen rows go into Adversus as private callbacks with a note, and every
  lead is read back afterwards to prove it landed.
- **Your dialer: close it during this step, ca 1 min.** No dialer page is opened, but the writes
  use dialer sessions, and running them next to an open dialer is not tested yet. It never dials
  anyone.
- **Takes:** a few seconds per lead, plus the questions.
- **You need:** Chrome logged in to Adversus.
- **You get:** the leads in your callback queue, each due 5 minutes after it is saved.
- **Questions:** campaign, which rows, `Save lead as`, all at once.

The answers are the go. Inside `lead-search` these were asked at the start: use those answers,
skip the questions in Step 1, Step 2 and Step 5b, and show only the one status line for step 4.
The checks in those steps (campaign name in the header, re-check before writing) still run.

At the end, say the real time. If it is far off, update the time here and in the `lead-guide`
menu.

## Step 1 - Ask which campaign

Ask the booker which campaign the leads go into, every time, and wait for the answer. Do not infer
it from the ort, and do not reuse the campaign from the last run.

The reason is that a lead in the wrong campaign is close to invisible. It does not show up in the
booker's queue, it does not show up for the colleague who works that area, and nothing about the
lead looks wrong when you open it. Compare the Poly-Produkter case in the project memory, where a
company was closed as Invalid in a Göteborg Centrum campaign while the site a salesperson would
actually visit sat untouched in Vårgårda.

The campaign list is at `https://app.adversus.io/dialer#/list/campaigns`. Read the names off that
page and put them in front of the booker rather than typing a name from memory. The create form
takes a numeric campaign id in the URL, so once the booker has picked, get the id by opening that
campaign from the list.

Known ids are in the country file. When you read a new id, add it there.

The campaign id is not in the page anywhere, and the id order in the lead-count stream URL is not
the display order, so do not count rows to guess it. Read it from the API instead, in the browser,
on any Adversus page. `javascript_tool` does not return the value of a promise, so park it on
`window` in one call and read it in the next:

```js
window.__c = 'pending';
fetch('/api/v2/campaigns', {headers:{'Accept':'application/json'}})
  .then(r => r.json())
  .then(j => { window.__c = j.filter(c => /teborg/.test(c.name)).map(c => 'id ' + c.id + ' is ' + c.name).join('\n'); });
```

Then `String(window.__c)`. Write the line as `id 122697 is <name>` rather than `122697 = <name>`;
an equals sign between values trips the browser tool's content filter and the result comes back
blocked. `bbSetup` in the next step returns the campaign name for that id, which is the check.

## Step 2 - Ask which rows

First the group, unless the booker already answered the closing question of `lead-search`:

> (a) bara nya (1a, N st), (b) bara befintliga utan samtal (1b, N st), (c) båda

Then show the chosen rows as a numbered list, company name, number of employees and, for 1b, the
lead id and status, and ask which rows to enter. Wait for the answer. "All of them" is a perfectly
normal answer and is what he will usually say, but he says it, you do not assume it.

Callbacks are all set to 5 minutes, however many rows there are. Do not offer to spread them out
(booker's instruction, 2026-10-21; changed from 15 to 5 minutes 2026-10-27).

This is a write into a live CRM that a whole team works from, and the list is often long enough
that reading it back is the only chance anyone gets to catch a row that should not go in. It costs
one message.

If the ringlista has no table 2, that means the Adversus check has not been run on it. Say so and
offer to run `adversus-check` first. Entering unchecked rows is how duplicates get made.

Right before creating a 1a row, search its org.nr once more. If it now exists, treat it as a 1b row
if nobody has spoken to it, or skip it if somebody has, and say so in the report.

## Step 3 - Load the script

Open `https://app.adversus.io/adversus-api/v2/users` in a new tab. It is a plain JSON page on the
right origin, so no dialer loads and nothing redirects. Paste the whole of `scripts/entry.js` into
`javascript_tool`, then:

```js
await bbSetup(<campaign id>, '<booker name as in Adversus>')
```

It checks the login, loads the campaign's fields and looks up the booker's user id. Check the
campaign name it returns against what the booker chose before writing anything. A line starting
with `STOP` means stop and tell the booker. A login page means stop too: never enter credentials.

Every function returns one short line. Keep a few leads per `javascript_tool` call so the output
stays under the tool's limit of about 1000 characters.

## Step 4 - The field mapping

The left column is the exact key to use in `bbCreate`'s `fields`. A name the campaign does not have
stops the call before anything is written. Leave a field out when its value is `ej hittad` /
`ikke fundet`; the script drops those anyway.

| Adversus field | Sweden | Denmark |
|---|---|---|
| Firmanavn | Företag | Virksomhed |
| CVR | Org.nr **without** the dash, `5565284329` | CVR, 8 digits |
| Adresse | Full address, `Hötorgshallen 38, 111 57 Stockholm` | Full address (to confirm) |
| Vejnavn | Street and number | Street and number |
| Postnummer | 5 digits, no space | 4 digits |
| By | Postort in capitals | By (to confirm) |
| Antal Ansatte (SE) | Employees, a number | (to confirm) |
| Branche Tekst | Typ | Type |
| Email | E-post | E-mail |
| **Telefon** | Nummer att ringa | Nummer at ringe |
| Country | `Sweden` | `Denmark` |
| Purpose | Registered business description, verbatim | Formål from CVR, verbatim (to confirm) |

**Purpose** is the company's registered business description, copied word for word from the
`Verksamhet & ändamål` section of the company's allabolag page (`https://www.allabolag.se/<org.nr
without dash>`). Example: `Bolaget ska bedriva köp- och försäljning av herr- och
damkonfektionsartiklar samt därmed förenlig verksamhet.` Fetch it when entering the lead. Never
shorten, translate or rewrite it. If the page has no description, leave the field empty.

`Antal Ansatte (SE)` is a number field. When the registry only gives a band (`5-9`), leave the
field empty and put the band in the note's `INFO:` instead (seen 2026-10-15, Fisken).

Fill `Adresse` with the full visiting address (street and number, postnummer, ort) and `Vejnavn`
with the street and number only. Booker's instruction, 2026-10-15.

The org number goes in without the hyphen because that is how Adversus stores it. `556728-4301`
finds nothing, `5567284301` finds the lead. Getting this wrong makes the company invisible to the
next Adversus check, which is how the same company ends up entered twice a month later.

The create form has fifteen phone fields: `Telefon`, `Telefon 2`, `Telefon - Google 1` and `2`,
`Telefon - Hitta 1` and `2`, `Telefon - PES 1` and `2`, `Webscrape - Proff`,
`Teledata - Telefon 1` and `2`, `Teledata - Navn 1` and `2`, `Webscrape - Telefon 1` and `2`.
Use **`Telefon`**. That is the booker's choice and it is confirmed working: after saving, the
number appears in the dialer's own phone box at the top of the lead, which is the box the call
goes out from. Through the API, pass digits only, `0456699300`. Adversus formats it and adds it to
the lead's numbers, which is what the dialer rings (verified 2026-10-27, Sölvesborg).

Do not fill `Lead Source`, `Priskategori`, the `ML -` fields, `Nuværende løsning`,
`Marketing Lead Campaign` or the booking fields further down. Those are filled on the call, by the
person on the call.

## Step 5 - The note

The note is what the booker reads in the two seconds before the phone is answered, so it is
written for that moment and nothing else.

Adversus drops the line breaks when it shows a saved note in the lead timeline, so every note ends
up as one paragraph. Line breaks cannot be what separates one person from the next. The format has
to read correctly as a single line, with every number sitting directly next to the person it
belongs to.

### The format

The labels, their order and examples are in `ADVERSUS-TEMPLATE.md`. Why the rules there matter:

- **` | ` instead of line breaks**, because the timeline shows the note as one paragraph.
- **Name before number**, because in a run-on paragraph a number at the end of one person reads as
  the start of the next.
- **Every verified number**, because a note with one number leaves the booker stuck when it does
  not answer.

### When nobody is named on the web

`FRÅGA EFTER:` / `SPØRG EFTER:` with the words `enligt bolagsregistret` / `ifølge CVR` is the
whole point of the piece. A name from the company register is a legal fact
that gets a booker past a receptionist, and it is not a person who is expecting the call. A booker
who cannot tell the two apart opens with the wrong sentence. If the register names nobody either
(a förening), leave it out.

### INFO

Keep it to what the template says. Everything else already lives in the list.

On an existing lead whose dialled phone is wrong (see "Refreshing a lead" below), the right number
still goes in `RING:`, and INFO says that the lead's own phone field dials the wrong number.

## Step 5b - Save lead as

The `Save lead as` field decides whose queue the callback lands in, and on an existing lead it is
pre-filled with the last agent who touched it, not with the person sitting at the browser. Left
alone it hands the booker's callback to a colleague and records the work under someone else's
name. Set it to the booker on every lead, new or existing. If you do not know the booker's name as
it appears in Adversus, ask before Step 3. Never assume it.

Through the API this is the name passed to `bbSetup`. It finds that user's id, and every lead,
new or refreshed, is saved with that user as owner. On the page fallback the field needs the
click-and-type method in "If the API fails" below.

## Step 6 - Result data

The same three settings on every lead:

- `Callback time` = **5 minutes**
- `Private callback` ticks itself when the callback time is set, leave it ticked
- `Status` = **Callback**

Five minutes is fixed. If the booker wants something else he will say so in the request, and
then you do what he said, but there is no question to ask here.

`Blocklist lead` stays unticked. Ticking it is close to unrecoverable from the booker's side.

`entry.js` sends exactly this on every lead: status `Genopkald`, callback `PT5M`, private, not
blocklisted, owner from `bbSetup`.

## Step 7 - Write

New rows (1a), one call each:

```js
await bbCreate({note: '<note from Step 5>', fields: {Firmanavn: 'Meritum i Sverige AB', CVR: '5566802483', Adresse: 'Industrivägen 13, 294 39 Sölvesborg', Vejnavn: 'Industrivägen 13', Postnummer: '29439', By: 'SÖLVESBORG', 'Antal Ansatte (SE)': '45', 'Branche Tekst': 'Städfirma', Email: 'info@meritum.nu', Telefon: '0456699300', Country: 'Sweden', Purpose: '<verbatim>'}})
```

It searches the company ID once more and returns `SKIP` if the company is in Adversus by now.
Treat that row as 1b if nobody has spoken to it, or leave it if somebody has, and say so in the
report. Otherwise it creates the lead and saves it, and returns its lead id.

Existing rows (1b) go through `bbRefresh`, see "Refreshing a lead" below.

**Do the first lead alone and run `bbVerify` on it** before the rest. One wrong field caught here
is one wrong field, caught after twenty leads it is twenty.

`STOP: empty lead <id> left in the campaign` means the lead was created but the save failed. Tell
the booker the id. Nothing else is written until he answers.

## Refreshing a lead that exists but was never dialled

Added 2026-09-01, on the Alingsås run, at Pål's request.

`adversus-check` routinely finds companies that are in the CRM with a settled-looking
status and no conversation behind them: no calls at all, or nothing longer than a few seconds, or
an `Invalid` stamped after a two second call to a number that turns out not to be the company's.
Those rows sit in table 1 precisely because nobody has worked them. Leaving them there means the
research that produced the contact people never reaches the person who dials.

These are the 1b rows. When the booker picks (b) or (c) in Step 2, they get the same treatment as
the new ones, minus the creation. This is a standard part of the run, not an exception
(booker's instruction, 2026-10-21):

- **Re-check first.** Right before writing, read the lead's timeline again. If a call of 20 seconds
  or more has appeared, or someone else has put it on a callback since the list was made, skip it
  and name it in the report. The list can be days old, and a colleague may have reached them since.
  `bbRefresh` does this check itself and returns `SKIP` with the reason.
- Write the note exactly as Step 5 describes, then `await bbRefresh(<lead id>, '<note>')`.
- It saves `Callback time` 5 minutes, `Status` Callback, owner the booker, per Step 5b and Step 6,
  and changes nothing else.
- A lead in another campaign than the one in `bbSetup` returns `STOP`. Run `bbSetup` with that
  lead's campaign and try again. Refreshing never moves a lead.

What you cannot change, and must handle in the note instead: on an existing lead the company
fields stay as they are (`bbRefresh` sends them back untouched), and so does the phone the dialer
will actually call. A lead whose primary number is wrong will still ring the wrong number when the
callback comes due. Put the right number in `RING:`, say in `INFO:` that the lead's own phone dials
the wrong one, and tell the booker in the closing report which leads have that problem so he dials
those by hand.

Do not do this to a row from table 2. A lead somebody has genuinely spoken to keeps the status that
conversation earned it, and quietly turning a `Not interested` into a callback is how a team starts
ringing people who already said no.

## Step 8 - Read every lead back

A save that silently failed looks like a save that worked, so nothing is finished until the CRM has
been asked.

Run `await bbVerify(<lead id>)` on every lead written. Each line should show `Genopkald private`,
the booker's user id as owner, the chosen campaign id, the right name, org.nr and postnummer, the
number from `RING:` or `Telefon` under `dials`, and at least one note. Search returns no field
values, so `bbVerify` opens the lead and saves it again unchanged, with its callback time pinned to
the one it already has. That adds one more save line to the timeline, which is expected.

Do not use the counters on the campaign list to verify. `My callbacks` stays where it was after
creating twenty two leads, because a callback five minutes out counts as `Upcoming leads` and
does not become yours until it is due. That number looking wrong does not mean anything went
wrong, and it looking right would not have meant anything either.

## Step 9 - Give the dialer back

Close the tabs you opened. Then say `Dialer free, you can use Adversus again.`

Then report: how many leads went in, which campaign, and anything a row carries that he should know
before it comes up in his queue. A row with an empty postnummer, a switchboard in another town, a
visiting address that differs from the registered one. Short lines, one per row that has something
worth saying, nothing for the rows that are ordinary.

## If the API fails

Use this only when `entry.js` returns `STOP` for a reason that is not the booker's to fix, and
only after the booker says yes. It is the old way: the reactive dialer page, filled by script and
clicked by hand. It keeps the dialer busy for 1-2 minutes per lead.

**Open the create form.** `https://app.adversus.io/reactive-dialer?campaign=<id>&mode=create`.

**Only one dialer window per user is allowed.** If the booker has the dialer open anywhere else,
the page shows "You have another dialer open" with a Retry button, and Retry keeps failing until
that other window is genuinely closed. Ask him to close it and wait. Do not close it yourself and
do not keep clicking Retry: the other window may be a live call, and taking it away from him mid
conversation is not yours to do.

When the page loads correctly the header shows the campaign name and `Lead status: Unprocessed /
New lead`. Check the campaign name against what the booker chose before typing a single field.

**Save lead as.** On the create form for a new lead the field may not be shown at all. Then the
lead is saved as the logged-in user, which is fine when that user is the booker (seen 2026-10-15,
Stockholm Centrum). Say so in the report.

It is not a normal input and `__set` cannot reach it: the label points at a div, and the value
lives in a listbox that opens on click. What works is `computer:triple_click` on the field followed
by real typing of the first few letters of the name, which opens the list and selects the match.
It regularly does nothing on the first attempt, right after a page load or a field fill, and works
on the second. So always read it back, from a screenshot or with `innerText` on the container, and
repeat the click and type until the field shows the right name. Do this last, after the note and
the selects, because filling the note moves the field about thirty pixels up the page.

**Fill and save.** Doing this by hand is eleven fields times however many leads, and clicking each
one is slow enough that it becomes its own source of errors. Fill through the page instead. The
labels carry a `for` attribute pointing at the input id, and React accepts a value set through the
native setter:

```js
window.__set = (labelText, value) => {
  const l = Array.from(document.querySelectorAll('label')).find(x=>x.innerText.trim()===labelText);
  if(!l) return 'NO LABEL: '+labelText;
  const el = document.getElementById(l.getAttribute('for'));
  if(!el) return 'NO INPUT: '+labelText;
  const proto = el.tagName==='TEXTAREA' ? window.HTMLTextAreaElement.prototype
              : el.tagName==='SELECT' ? window.HTMLSelectElement.prototype
              : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value').set.call(el, value);
  el.dispatchEvent(new Event('input',{bubbles:true}));
  el.dispatchEvent(new Event('change',{bubbles:true}));
  return 'ok';
};
```

The two selects take Danish internal values, not the English labels on screen:
`Callback time` takes `PT5M` (not yet tried on the page), `Status` takes `Genopkald`.

Save with the button, not with a form submit:

```js
Array.from(document.querySelectorAll('button')).find(x=>x.innerText.trim()==='Save lead').click();
```

Then wait about five seconds. The form clears itself and the `Lead ID` in the header increments,
which is a usable signal that the save went through and the next lead can be typed.

Four leads per `javascript_tool` call is about right. More than that and the call exceeds the 45
second CDP timeout and you lose track of which leads were saved.

**Do the first lead alone and look at it before saving.** Take a screenshot with every field
filled and compare it against the mapping above. One wrong field caught here is one wrong field,
caught after twenty leads it is twenty.

**This technique does not work on the Adversus search box.** Setting its value the same way and
dispatching a synthetic Enter returns "No data available" without ever searching, which looks
exactly like a real miss. The search box needs a real `computer:triple_click` on its coordinates,
real typing and a real Return. That trap cost four false negatives on the Lidköping run and was
only caught by a control search.

**Refresh a 1b lead** the same way, opened with
`https://app.adversus.io/reactive-dialer?mode=edit&leadid=<id>`: note, callback, status, `Save
lead as`, save, change nothing else.

**Read back.** Open `https://app.adversus.io/dialer#/list/search-campaigns` and search each
undashed organisationsnummer, using the triple-click-and-type method above. Each one should return
exactly one row, with the right campaign in the `Campaign` column and `Private callback` in
`Status`. Use `find` rather than `get_page_text` to read the result, since it returns one compact
line per search instead of the whole page.

Open one finished lead and read it properly, fields and note both, to confirm the mapping landed
the way you think it did. `https://app.adversus.io/reactive-dialer?mode=edit&leadid=<id>` opens a
lead without calling anyone. While that page is open, touch nothing: not the green call button, not
`Save lead`, not `Status`, not `Blocklist lead`.

Navigate away from the reactive dialer when you are done, so the booker can open his own again.

## The rule that outranks everything above

A blank field is a visible problem. An invented one is not.

Everything written here comes off the ringlista, and the ringlista got it off a page that was
actually fetched. Nothing is filled in from what a value ought to be. If a row has `ej hittad` in
Org.nr, the CVR field stays empty and you tell the booker that lead cannot be checked against
Adversus next time. If the visiting address has no postnummer you could verify, `Postnummer` stays
empty and the note says why. A guessed postnummer is not a small thing: it is a salesperson
driving to the wrong side of town, and nothing in the CRM will ever look wrong.

Organisationsnummer, phone numbers and email addresses are the three that are easiest to produce
out of nothing, because they all have a shape you can imitate. They are copied from the ringlista
cell, digit by digit, and never reconstructed from a pattern, never carried across from a similarly
named company, and never adjusted to look more correct.

## Out of scope

Finding companies, verifying them and building the ringlista belong to `lead-search`.
Deciding whether a company is already worked belongs to `adversus-check`. Filling the
booking form after a call belongs to `call-intake`. This skill types verified rows into a CRM and
proves they arrived, and that is all it should ever do.
