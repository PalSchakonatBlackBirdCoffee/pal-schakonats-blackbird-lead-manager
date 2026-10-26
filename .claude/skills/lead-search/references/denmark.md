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
- Enkeltmandsvirksomheder are dropped unless the registry shows 4 or more employees.

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

Field mapping is in `adversus-entry` Step 4, with Danish values marked (to confirm). The note
format is in `ADVERSUS-TEMPLATE.md` in the project root.

Before the first Danish entry, open one existing lead in the chosen Danish campaign and match its
field shape (which address field holds the street, how By is written). Then update the Denmark
column in `adversus-entry` Step 4.

Campaign ids: none known yet. Read them from the live list (adversus-entry Step 1) and add them
here:

| Campaign | Id |
|---|---|
| | |
