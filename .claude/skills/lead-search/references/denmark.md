# Denmark

Read this when the anchor or area is in Denmark. Lists are written in Danish and saved in
`ringlistor/dk/`.

This file starts thin. After each Danish run, add what turned out to be true and fix what turned
out to be wrong. Lines marked **(to confirm)** are assumptions from the MVP setup.

## Places

- Address: street and number, four digit postnummer, by. Kommune for the municipality.
- Business areas are called erhvervsområde, industrikvarter, erhvervspark or handelsområde.

## Company ID

CVR-nummer, eight digits, written without spaces in the table: `12345678`.

- One CVR can have several production units (P-nummer), one per physical site. When a company has
  several sites, use the P-enhed at the address you are listing to read the site's employee
  figure, and keep the CVR in the ID column.
- Enkeltmandsvirksomheder are dropped unless the registry shows 3 or more employees.

## Sources

| Source | Good for |
|---|---|
| datacvr.virk.dk | The official register: name, CVR, status, address, employee interval, production units |
| proff.dk | Employees, leadership, phone, quick status check |
| krak.dk | Phone numbers, listings by street and area |
| degulesider.dk | Phone numbers, listings by area |
| Google Maps | Coverage check, see SKILL.md Step 3 |

Maps search terms that work **(to confirm)**: `virksomhed`, `værksted`, `autoværksted`, `butik`,
`industri`, `kontor`.

Learned on Hasselager-Tilst (2026-10-29):

- proff.dk reads by script: `https://www.proff.dk/firma/-/-/-/<companyId>`, data in `__NEXT_DATA__`
  (`props.pageProps.company`: phone, status, employees, visitorAddress, mainOffice). `homePage` is
  almost always empty, and a P-enhed page often has no phone. Take the site's own number and website
  from Google Maps (`<name> <street> <postnummer>`).
- A P-enhed of a chain shows the parent's manager. That is the chain's CEO, not a contact.
- Website scan: `get-site-contacts.ps1 -Country DK`. CVR has the same shape as a phone number, so
  the script skips a number written right after `CVR`. Chain store pages name nobody.

Learned on the trade pilot, Aarhus and Silkeborg (2026-10-30):

- From a script, proff.dk search, krak.dk, degulesider.dk and datacvr.virk.dk answer 403. A proff.dk
  company page works. From a proff.dk tab in Chrome, `fetch('/branchesøg?q=<phone or name>')` works,
  about 5 rows per second, with CVR, employees, coordinates and `marketingProtection` in
  `__NEXT_DATA__` (`props.pageProps.hydrationData.searchStore.companies.companies`). The company page
  adds `companyType` and `status`. `q` searches company text, so `pizza` lists 1,711 companies
  nationally, up to 400 pages of 25, and `/brancher` links list a whole industry. 836 pages took 9
  minutes with no limit hit. It found 68% of pilot shops with a known CVR: a legal name without the
  trade word is the gap. Listings can include Greenland (39xx, +299), filter them out.
- Phone first, then name plus under 250 m. A hit found only by shared address is often the neighbour.
- Maps list cards hide phone and address for restaurants. Read the place page, about 3 s each.
- A town name that is also a word (`Them`) sends Maps abroad. Filter on coordinates.
- `api.dataforsyningen.dk` (DAWA) answers 410 Gone. Use the postnummer on the Maps place page.
- A CVR scanned from a shop's site can belong to its ordering platform. Check it against the registry.

Limits, national run (2026-10-30):

- Google Maps: one tab at about 10 lookups a minute held up. Four tabs plus a replayed search request
  got `429`. Stop on a 429, never retry fast.
- krak.dk pages carry JSON-LD with phone and address, and the detail page has `taxID` (CVR) and
  `sameAs` (website). But it answers `429` after 20 to 30 requests, even at one per 2.5 s, so it only
  suits a handful of lookups. An 8-digit search is read as a phone number.
- Adversus returns a lead's number only by opening a session, which is not read-only. Do not use it
  to read numbers. Most companies in these trades are already leads (1,424 + 1,245 of 2,831).
- Chrome gives a tab one automatic download, and throttles hidden tabs to about one timer a minute.
  Keep state in `localStorage`, save from a fresh tab on the same site, and use web worker timers.

## Filter signs

- Paper entities: `Holding`, `Invest`, `Ejendomme`, `Administration` in the name with 0 to 4
  employees.
- Status on virk.dk other than `Normal` (for example `Under konkurs`, `Opløst`) means drop.
- Office hotels: Regus, Spaces, Mindspace, or an address shared with many small unrelated
  companies.
- The registered `Direktør` is a legal fact, not a contact. Use them only when the website names
  nobody, written as `Navn, direktør (ifølge CVR, intet direkte nummer)`.

## Phone numbers

Eight digits, no area code, in pairs: `86 12 34 56`. Mobile numbers look the same. Mark a
switchboard `(omstilling)`.

## Language in the table

- Not found: `ikke fundet`
- Maps only: **`Kun Maps`**
- Table 1 groups: `1a. Nye, ikke i Adversus` and `1b. I Adversus, ingen har talt med dem`
- Closing question: `Skal jeg lægge dem ind i Adversus som private callbacks? (a) kun nye (1a, N stk), (b) kun eksisterende uden samtale (1b, N stk), (c) begge`

## Adversus

Checking a site, not just a company (2026-10-29): a chain or Aarhus Kommune CVR has 100+ leads, so
search `Adresse` (field 112626) for `<street> <number>` in lowercase, with the house letter joined
(`jegstrupvej 96b`, not `96 b`), four times, and keep values that start with `<street> <number>,`
and hold the postnummer. Some P-enheder leads store only `Koltvej 17`, with no postnummer.

Field mapping is in `adversus-entry` Step 4, with Danish values marked (to confirm). The note
format is in `ADVERSUS-TEMPLATE.md` in the project root.

Before the first Danish entry, open one existing lead in the chosen Danish campaign and match its
field shape (which address field holds the street, how By is written). Then update the Denmark
column in `adversus-entry` Step 4.

Campaign ids: none known yet. Read them from the live list (adversus-entry Step 1) and add them
here:

| Campaign | Id |
|---|---|
| Midtjylland - Aarhus + Skanderborg + Odder + Favrskov | 103248 |
| Midtjylland - Silkeborg | 103254 |
| Midtjylland - Herning + Ikast-Brande | 103259 |
| Maps - Blackbird Coffee | 104263 |
| Maps P-enheder - Blackbird Coffee | 104325 |
