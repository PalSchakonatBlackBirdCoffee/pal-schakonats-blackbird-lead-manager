# Sweden

Read this when the anchor or area is in Sweden. Lists are written in Swedish and saved in
`ringlistor/se/`.

## Places

- Address: street and number, five digit postnummer, postort. Kommun for the municipality.
- Business areas are called industriområde, företagspark, handelsområde or verksamhetsområde.
  Search their names directly, and check if the park has its own tenant list.

## Company ID

Organisationsnummer, written `NNNNNN-NNNN` in the table.

- `556` and `559`: aktiebolag
- `969` and `9xx`: handelsbolag and kommanditbolag
- `769`: ekonomiska föreningar
- `802`, `815`: ideella föreningar and stiftelser
- `252`: Svenska kyrkan, always excluded (see `REQUIREMENTS.md`). Frikyrkor sit under `802` and
  are excluded too

Enskilda firmor use the owner's personnummer and are dropped unless the registry shows 4 or more
employees: they are almost always one person.

## Sources

| Source | Good for |
|---|---|
| allabolag.se postnummer search | **Primary sweep.** Every company in a postnummer with org.nr, employees, address, phone, bransch and status remarks. See below |
| allabolag.se/`<orgnr>` | One company's own page, for a second check of org.nr, status and phone |
| hitta.se, eniro.se | Phone numbers, listings by area |
| Cylex | Extra directory listings |
| Google Maps | Coverage check, see SKILL.md Step 3 |
| ratsit.se, bolagsfakta.se, merinfo.se | Browser only. They return 403 to fetches and scripts |

**allabolag postnummer search.**
`https://www.allabolag.se/bransch-sök?q=<postnummer, five digits, no space>&sort=numEmployeesDesc&page=N`

- 25 companies per page, largest first. Pages 1 to 4 normally reach every company with 4 or more
  employees; stop at the first page where everyone has fewer than 4.
- The data sits as JSON in the page's `__NEXT_DATA__`. Parse it by script (PowerShell
  `Invoke-WebRequest` with a full browser user agent, about 1 second between calls) so org.nr and
  phone are copied exactly. A bare `Mozilla/5.0` user agent gets a 403.
- `status` is empty in the list. Read `statusRemarks` for konkurs, likvidation and fusion.
- Searching by street name only matches company names. `/search` returns an error.
- Companies registered at a head office elsewhere (chain branches) do not show up. Maps finds them.

Maps search terms that work: `företag`, `verkstad`, `bilverkstad`, `butik`, `industri`,
`restaurang`. `kontor` mostly returns office hotels: useful for finding them, not for leads.

## Filter signs

- Paper entities: `Holding`, `Invest`, `Förvaltning` in the name with 0 or 1-4 employees.
- Office hotels: Regus, Spaces, Convendum, Ideon, Mindpark, Minc, Epic, United Spaces, Qoffice,
  Media Evolution City, or an address shared with many small unrelated companies.
- Known office hotel and shared addresses, Malmö (seen in the 2026-10-16 run): Jungmansgatan 12
  (WTC), Lilla Varvsgatan 14, Riggaregatan 53, Skeppsgatan 19, Carlsgatan 12A (Mindpark),
  Nordenskiöldsgatan 11 and 24, Stora Varvsgatan 6A, Hans Michelsensgatan 9, Elbegatan 5,
  Anckargripsgatan 3, Adelgatan 21 (Regus), Stortorget 8 and 29, Kalendegatan 26, Hyllie
  Stationstorg 31, Hyllie Boulevard 53, Hyllie Stationsväg 41.
- The registered `Verkställande direktör` or `ordförande` is a legal fact, not a contact. Use them
  only when the website names nobody, written as
  `Namn, VD (enligt bolagsregistret, inget direktnummer)`.

## Phone numbers

Area code, dash, number in groups: `08-560 387 00`, `031-12 34 56`, `070-123 45 67`. Mark a
switchboard `(växel)`.

## Language in the table

- Not found: `ej hittad`
- Maps only: **`Endast Maps`**
- Table 1 groups: `1a. Nya, ej i Adversus` and `1b. Finns i Adversus, ingen har pratat med dem`
- Closing question: `Vill du att jag lägger in dem i Adversus som private callbacks? (a) bara nya (1a, N st), (b) bara befintliga utan samtal (1b, N st), (c) båda`

## Adversus

Field mapping is in `adversus-entry` Step 4. The note format is in `ADVERSUS-TEMPLATE.md` in the
project root.

Known campaign ids (always confirm against the live list, see adversus-entry Step 1):

| Campaign | Id |
|---|---|
| Sweden - Göteborg nord area | 116300 |
| Sweden - Göteborg Centrum/South | 117752 |
| Sweden - Göteborg East | 122697 |
| Sweden - Stockholm Centrum | 123060 |
| Sweden - Stockholm Syd | 123072 |
| Sweden - Stockholm Nord | 123074 |
| Sweden - Stockholm Øst | 123078 |
| Sweden - Stockholm Vest | 125452 |
| Sweden - Ystad area | 111982 |
| Sweden - Sydöst Ystad | 116554 |
| Sweden - Kronoberg/Blekinge | 123308 |
| Sweden - Kalmar | 125582 |
| Sweden - Malmö & Sydvest | 116549 |
| Sweden - Malmø area | 107556 |
| Sweden - Lund & Midt-Skåne | 116558 |
| Sweden - Helsingborg & Nordvest | 116553 |
| Sweden - Helsingborg area | 110112 |
| Sweden - Halmstad Syd | 121592 |
| Sweden - Halmstad Nord | 122207 |
| Sweden - Nordøst | 116556 |

Båstad, Laholm and Mellbystrand companies sit mostly in Sweden - Halmstad Syd, some in the
Helsingborg campaigns.

Malmö companies sit mostly in Sweden - Malmö & Sydvest and Sweden - Malmø area.
