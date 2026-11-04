# Sweden

Read this when the anchor or area is in Sweden. Lists are written in Swedish and saved in
`ringlistor/se/`.

## Places

- Address: street and number, five digit postnummer, postort. Kommun for the municipality.
- A company belongs to the kommun of its visiting address or of its registered seat (säte, the
  `domicile` on its allabolag page). Adversus lists such as the DataPeeps pool follow the seat: in
  Linköping and Norrköping (2026-11-03), 106 of 2,547 had their visiting address in another kommun.
  The sweep sees only the visiting address, since search results carry no seat, so a company that
  is in Adversus but missing from the sweep is looked up on `allabolag.se/<orgnr>` before it counts
  as missed.
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

Enskilda firmor use the owner's personnummer and are dropped unless the registry shows 3 or more
employees: they are almost always one person.

## Sources

| Source | Good for |
|---|---|
| allabolag.se postnummer or kommun search | **Primary sweep**, by `scripts/sweep-allabolag.ps1`. Every company in a postnummer or kommun with org.nr, employees, address, phone, bransch and status remarks. See below |
| allabolag.se/`<orgnr>` | One company's own page, for a second check of org.nr, status and phone |
| hitta.se | Phones, website and coordinates per org.nr, by `scripts/hitta.ps1` |
| eniro.se | Phone numbers, listings by area |
| Cylex | Extra directory listings |
| Google Maps | Coverage check, see SKILL.md Step 3 |
| ratsit.se, bolagsfakta.se, merinfo.se | Browser only. They return 403 to fetches and scripts |

**allabolag postnummer search.**
`https://www.allabolag.se/bransch-sök?q=<postnummer, five digits, no space>&sort=numEmployeesDesc&page=N`

- 25 companies per page, largest first. Pages 1 to 4 normally reach every company with 3 or more
  employees; stop at the first page where everyone has fewer than 3.
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
| Blekinge - Karlskrona, Ronneby, Karlshamn, Olofström, Sölvesborg | 127190 |
| Sweden - Kalmar | 125582 |
| Kalmar - Kalmar, Nybro, Mörbylånga, Borgholm, Emmaboda, Torsås | 127191 |
| Kalmar - Oskarshamn, Mönsterås, Högsby | 127192 |
| Kalmar - Västervik, Vimmerby, Hultsfred | 127193 |
| Stockholm - Stockholm, Solna, Sundbyberg, Ekerö | 127198 |
| Sweden - Malmö & Sydvest | 116549 |
| Sweden - Malmø area | 107556 |
| Sweden - Lund & Midt-Skåne | 116558 |
| Sweden - Helsingborg & Nordvest | 116553 |
| Sweden - Helsingborg area | 110112 |
| Skåne - Helsingborg, Höganäs, Ängelholm, Bjuv, Åstorp | 127182 |
| Sweden - Halmstad Syd | 121592 |
| Sweden - Halmstad Nord | 122207 |
| Sweden - Nordøst | 116556 |
| Göteborg - Kungälv, Ale, Lilla Edet, Stenungsund, Tjörn | 127131 |
| Göteborg - Trollhättan, Vänersborg, Grästorp, Essunga, Färgelanda, Mellerud | 127133 |
| Göteborg - Göteborg | 127128 |
| Sweden - test (holds bulk imported leads from 2026-10-27, check with the booker before refreshing one) | 127278 |

Båstad, Laholm and Mellbystrand companies sit mostly in Sweden - Halmstad Syd, some in the
Helsingborg campaigns.

Malmö companies sit mostly in Sweden - Malmö & Sydvest and Sweden - Malmø area.

Västerås companies sit mostly in Sweden - Stockholm Nord (2026-10-27: 16 of 18 address hits, the
40 Västerås leads for Viet went there). Västerås was nearly untouched: 382 of 396 checked were new.

Eskilstuna companies sit mostly in Sweden - Stockholm Nord (2026-10-28: 39 of 44 org.nr hits, the
rest Stockholm Vest). A postnummer search showed only Stockholm Syd, so check by org.nr before
naming a campaign. 207 of 251 checked in 633 xx were new. The 15 leads for Malin around Nystrandsgatan
went to Stockholm Nord (2026-10-30): 132 of 175 checked within 2 km were new.

Gävle and Valbo have no campaign of their own. The two Valbo companies in Adversus (Café Z, Konditori
Madame) sit in Sweden - Göteborg Centrum/South, and the 16 Valbo leads for Valon went there
(2026-10-28). Gävle kommun was nearly untouched: 834 of 842 checked were new. The 14 new Gävle centrum
leads for Malin around Nygatan 25 went to Sweden - Stockholm Nord (2026-10-30): 126 of 129 checked within
about 0.6 km were new.

Gnesta kommun was nearly untouched (2026-10-29): 50 of 53 checked were new. The 36 Gnesta and
Björnlunda leads for Pål went to Sweden - Stockholm Syd. The three hits sat in Stockholm Centrum and
Göteborg - Kungälv.

Around Björnlunda outside Gnesta kommun (2026-10-30): of 204 checked in Trosa, Södertälje, Nyköping
and Strängnäs, 137 were new, 57 in Adversus without a conversation, 10 worked. The Mölnbo and Järna
leads already in Adversus sit mostly in Sweden - Stockholm Vest. Mölnbo, Tystberga and Vagnhärad are
within 30 minutes of Björnlunda; Ensta Gård, Åkers Styckebruk, Hölö and Bommersvik are not.

Staffanstorp and Kävlinge are heavily worked (2026-10-30: 101 of 121 checked along Hasslarp-Staffanstorp had a real call). Their existing leads sit mostly in Sweden - Malmø area and Sweden - Malmö & Sydvest, not Sweden - Lund & Midt-Skåne. Kattarp and Glumslöv leads sit in Sweden - Helsingborg & Nordvest.

Älmhult companies sit in Sweden - Kronoberg/Blekinge (2026-10-30: all 5 refreshed leads for Pål).

Ystad and Simrishamn companies sit in Sweden - Ystad area and Sweden - Sydöst Ystad (2026-10-30: of 408 checked along väg 9, 252 worked, 82 in Adversus without a conversation, 74 new, most new ones with no phone). The 5 new Herrestad-Simrishamn leads for Annika went to Sydöst Ystad.

Mörrum and Asarum companies sit in Sweden - Kronoberg/Blekinge (2026-10-30: all 16 leads checked). The 15 Mörrum leads for Pål went there. Annika had callbacks on 6 other candidates, and those were left with her.

Höganäs and Ängelholm companies sit mostly in Sweden - Helsingborg & Nordvest (2026-11-02: of 554 checked, 304 worked, 65 in Adversus without a conversation, 185 new, many of the new ones with no phone). The 19 new Höganäs leads for Lina went to Skåne - Helsingborg, Höganäs, Ängelholm, Bjuv, Åstorp on Pål's choice. Vejbystrand is 36 minutes from central Höganäs, central Ängelholm 24.

Halmstad, Falkenberg and Tvååker companies sit mostly in Sweden - Halmstad Syd (2026-10-30: 10 of 16 org.nr hits, the rest Göteborg Centrum/South and Stockholm Centrum). The 15 Laholm-Varberg leads for Pål went there. Along the E6, Laholm, Halmstad and central Varberg are mostly worked, while Falkenberg, Långås and Tvååker were nearly untouched.

Emmaboda companies sit in Sweden - Kalmar (2026-11-03): all 12 checked were bulk entered there on 2026-10-08, Unprocessed with an empty timeline, so the whole kommun looks like 1b. Meza Storgatan 19 AB is registered in Emmaboda but the restaurant is in Borgholm. The 5 florist, café and restaurant leads went to Pål.

Osby and Östra Göinge companies sit in Sweden - Nordøst (2026-11-03: of 199 checked, 73 worked, 81 in Adversus without a conversation, 45 new, most of the new ones small or with no phone). Around Lekoseum in central Osby every 1b lead was in Nordøst, none with a colleague's callback. The 2 new Osby leads for Pål went to Sweden - Kronoberg/Blekinge on his choice, the 13 refreshed ones stayed in Nordøst. Several Osby leads in Nordøst carry old company names on the right org.nr and dial an old number first.

Skövde has no campaign of its own and was nearly untouched (2026-11-03): of the 73 companies nearest Kungsgatan 12, 68 were new, 2 in Adversus without a conversation, 3 worked. The hits sat in Göteborg nord area, Göteborg Centrum/South, Göteborg East and 127132. The 10 new leads for Malin Knutz around El Taco Pérez went to Sweden - Göteborg East on Pål's choice. Kanikegränd 3 b (Science Park Skövde) and Stationsgatan 7-9 (Bahnhof Collaborative Workspace) are office hotels.

Jönköping has no campaign of its own and was nearly untouched (2026-11-03): of the 160 companies nearest Science Park, 142 were new, 6 in Adversus without a conversation, 12 worked. The 8 leads with postnummer 553 xx sat in Sweden - Göteborg Centrum/South. The 14 new leads for Pål around Lasarettsgatan 2 went to Sweden - Kronoberg/Blekinge on his choice. Science Park Jönköping (Lasarettsgatan 2, Gjuterigatan 9, Framgången 1) is an office hotel.

Central Kalmar (Kvarnholmen and Malmen) is heavily worked from Pål's login (2026-11-03): of the 250 companies within about 2 km of Larmgatan 5, 31 were new (most with no phone), 114 in Adversus without a conversation, 105 worked. Most 1b leads sit in Sweden - Kalmar, bulk entered 2026-10-08. Several 1b leads dial an old registry number first. The 15 leads for Pål around Troy Trading AB were refreshed in place, two of them outside Sweden - Kalmar.

Växjö companies sit in Sweden - Kronoberg/Blekinge (2026-11-04): of the 104 companies nearest Arabygatan 13 (Västerport, within about 1 km), 26 were new, 54 in Adversus without a conversation (bulk entered 2026-09-04, mostly Aut. redial with no calls), 24 worked. The 15 leads for Lina around Rågårds Modehus went there. Several old leads carry old names (Växjö Taxi as Alvesta Taxi, Solklart as Dustbusters). Arabygatan 15 and Reveljgränd 5 hold several unrelated companies each, not office hotels.

Halland, whole kommuner (2026-11-03, full sweep, report in `test-runs/2026-11-03 Halland`): of 2,456 passing companies in Halmstad, Varberg, Falkenberg, Laholm, Båstad and Hylte, 902 were new, 392 in Adversus without a conversation, 1,162 worked. Falkenberg is nearly untouched (408 of 457 new). Halmstad, Laholm and Båstad leads sit in Sweden - Halmstad Syd, Hylte in Halmstad Nord, and most Varberg leads in Sweden - Stockholm Centrum (364), the rest in Halmstad Nord. The kommun campaigns Halmstad - Halmstad, Laholm, Båstad, Hylte (127195) and Halmstad - Varberg, Falkenberg (127196) held none of the leads found. allabolag's kommun search stops at 400 pages (10,000 companies), so Halmstad and Varberg need a postnummer sweep as well.
