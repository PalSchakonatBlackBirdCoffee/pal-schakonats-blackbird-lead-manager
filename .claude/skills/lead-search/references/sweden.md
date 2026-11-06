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
| Stockholm - Huddinge, Haninge, Nynäshamn | 127200 |
| Stockholm - Nacka, Värmdö, Tyresö, Lidingö | 127199 |
| Stockholm - Södertälje, Botkyrka, Salem, Nykvarn | 127201 |
| Stockholm - Täby, Danderyd, Vallentuna, Österåker, Vaxholm, Norrtälje | 127202 |
| Stockholm - Sollentuna, Upplands Väsby, Sigtuna, Upplands-Bro | 127203 |
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
| Göteborg - Mölndal, Kungsbacka, Härryda | 127127 |
| Uppsala - Uppsala, Knivsta, Tierp, Östhammar, Älvkarleby | 127151 |
| Göteborg - Borås, Bollebygd, Mark, Ulricehamn, Svenljunga, Tranemo | 127132 |
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

Västervik, Oskarshamn and Mönsterås along E22 are nearly untouched (2026-11-04): of 509 companies within a short detour, 97 were new, 405 in Adversus without a conversation, 7 worked. All 405 sit in Sweden - Kalmar, bulk entered 2026-10-08 as Unprocessed with no calls. Most new ones are small with no phone. The 3 new leads for Pål went to Kalmar - Oskarshamn, Mönsterås, Högsby (127192), the 7 refreshed ones stayed in Sweden - Kalmar. The first mode 2 Goldilocks run added 9 more (2 new to 127192, 7 refreshed in Sweden - Kalmar), 8 of them in Oskarshamn.

Oskarshamn kommun, whole area (2026-11-04): of 216 passing companies, 46 were new (most with no phone), 165 in Adversus without a conversation, 5 worked. Nearly all 1b sit in Sweden - Kalmar as Unprocessed with no calls. The 15 leads for Pål in the Stensberg industrial area (572 36) were refreshed there, callback next day 09:00. Many of these leads dial an old or wrong number first (Västervik or Vetlanda branches, a neighbour's number). On 2026-11-06, 10 more for Pål from Gröndalsgatan, Lokgatan, Verkstadsgatan (572 35) and the rest of 572 36: 1 new (Pub Kråkan) to 127192, 9 refreshed in Sweden - Kalmar. Nothing in those areas had been called in between. Not reached: centrum, Kristdala, Figeholm, Fårbo, Bockara.

Växjö companies sit in Sweden - Kronoberg/Blekinge (2026-11-04): of the 104 companies nearest Arabygatan 13 (Västerport, within about 1 km), 26 were new, 54 in Adversus without a conversation (bulk entered 2026-09-04, mostly Aut. redial with no calls), 24 worked. The 15 leads for Lina around Rågårds Modehus went there. Several old leads carry old names (Växjö Taxi as Alvesta Taxi, Solklart as Dustbusters). Arabygatan 15 and Reveljgränd 5 hold several unrelated companies each, not office hotels.

Värnamo-Strömsnäsbruk along the E4 (2026-11-04): of 381 checked in Värnamo, Ljungby and Markaryd kommun, 161 were new, 114 in Adversus without a conversation, 106 worked. Central Värnamo was nearly untouched. Ljungby and Lagan leads were bulk entered in early September, most never dialled. Strömsnäsbruk is worked out. The 15 new leads for Annika went to Sweden - Kronoberg/Blekinge on Pål's choice. Most Ljungby companies have no phone in hitta.

Växjö to Lönsboda along väg 23 and väg 121 (2026-11-04): of 732 checked within 6 km of the route, 159 were new, 364 in Adversus without a conversation, 200 worked. The Grimslöv, Eneryda, Älmhult and Växjö 1b leads sit in Sweden - Kronoberg/Blekinge, the Lönsboda ones in Sweden - Nordøst. The 15 leads for Pål between Gro Community and Helga servering went there. Gro Community, Södra Järnvägsgatan 4A, Växjö, is an entrepreneur hub: its tenants are coworking. Many old 1b leads dial wrong or unconfirmed numbers (079 numbers, old mobiles, a fax first).

Halland, whole kommuner (2026-11-03, full sweep, report in `test-runs/2026-11-03 Halland`): of 3,131 passing companies (3 to 50 employees) in Halmstad, Varberg, Falkenberg, Laholm, Båstad and Hylte, 1,244 were new, 531 in Adversus without a conversation, 1,356 worked. Falkenberg is nearly untouched (514 of 575 new). Halmstad, Laholm and Båstad leads sit in Sweden - Halmstad Syd, Hylte in Halmstad Nord, and most Varberg leads in Sweden - Stockholm Centrum (364), the rest in Halmstad Nord. The kommun campaigns Halmstad - Halmstad, Laholm, Båstad, Hylte (127195) and Halmstad - Varberg, Falkenberg (127196) held none of the leads found. allabolag's kommun search stops at 400 pages (10,000 companies), so Halmstad and Varberg need a postnummer sweep as well.

Around Skåne-Tranås (Tomelilla kommun, 2026-11-04): of 580 companies within about 30 minutes on the Sjöbo, Vollsjö, Tomelilla and Ystad side, 102 were new, 137 in Adversus without a conversation, 341 worked. The 1b leads sit in Sweden - Sydöst Ystad and Sweden - Ystad area (Sjöbo and Vollsjö leads mostly in Ystad area, bulk entered and never dialled). Annika holds shared callbacks on several Sjöbo and Vollsjö leads. The 20 leads for Pål went in: 4 new to Sydöst Ystad, 16 refreshed in place. Sjöbo centrum is 19 min from Skåne-Tranås, Ystad Stortorget 28.

Arlandastad to Uppsala along the E4 (2026-11-04): of 322 checked in Sigtuna, Knivsta and Uppsala kommun (10 to 32 km from the nearest meeting), 91 were new, 211 in Adversus without a conversation, 20 worked. Knivsta and outer Uppsala leads sit in Uppsala - Uppsala, Knivsta, Tierp, Östhammar, Älvkarleby (127151), bulk entered as Unprocessed with no calls; Vanessa's auto redial has started on a few. Sigtuna and Märsta leads sit in Sweden - Stockholm Nord. The 20 leads for Malin Knutz: 2 new to Stockholm Nord on Pål's choice, 18 refreshed in place. Knivsta is only 13-19 min from Arlandastad, so on this route prio 1 lands north and east of Uppsala. Some 127151 leads carry old names (Bronco Transmission as Cardan Norden, Nordic Ortopedica as Korrectio). YourSpace Knivsta is a coworking space.

Kungsbacka kommun north of Fjärås (Onsala, Vallda, Kungsbacka, Hede, Särö, Kullavik) is heavily worked (2026-11-04): of the 639 nearest Gottskärsvägen 174 in Onsala, 465 had a real call, 79 were in Adversus without a conversation, 95 new, most new ones one-person firms at home with no number. The 1b leads sit in Göteborg - Mölndal, Kungsbacka, Härryda (127127), bulk entered in October; the 8 new leads for Vanessa went there on Pål's choice. Billdal, Lindome and Kållered are within 30 minutes of Onsala and were not checked.


Kalmar stad outside Kvarnholmen and Malmen (2026-11-04): of 309 checked in 392 30, 392 35-47, 392 51-56 and 393 51-66, 53 were new, 192 in Adversus without a conversation, 64 worked. The 1b leads sit in Sweden - Kalmar, bulk entered 2026-10-08 and never dialled; Södra industriområdet (392 39), the airport area (392 41) and Norra industriområdet (393 56) hold most of them. The 10 leads for Pål went in with a callback the next day 09:00: 4 new to Kalmar - Kalmar, Nybro, Mörbylånga, Borgholm, Emmaboda, Torsås (127191) on his choice, 6 refreshed in place. Most new ones are associations with only a registry number. Bredbandet 1 (Kalmar Science Park, Varvsholmen) is an incubator address: tenants are dropped, Science Park itself is a lead.

Länna industriområde in Skogås (Huddinge kommun, 142 50) is dense and mostly bulk entered, never dialled (2026-11-04): of the 250 companies within about 2 km of Lyftkransvägen 5, 41 were new (the nearest ones all without a phone), 160 in Adversus without a conversation, 49 worked. Almost all sit in Stockholm - Huddinge, Haninge, Nynäshamn (127200), bulk entered as Unprocessed. The 30 leads for Malin Knutz around Enk Elkonsult AB were all refreshed in place, all within 500 m. Many of these leads dial a wrong number first: a 046 or 0500 area code in front of a Stockholm number, or an old hitta number. allabolag gives no coordinates for about 1 in 9 companies in the Huddinge sweep, so check the anchor's own streets by name too.


Central Ystad and its industrial estates (Blygatan, Stuvaregatan, Koboltgatan, Zinkgatan) are heavily worked (2026-11-04): of the 344 companies within about 15 km of Hamngatan 15, 201 had a real call, 71 were in Adversus without a conversation, 72 new, most new ones with no phone. The 1b leads sit in Sweden - Sydöst Ystad and Sweden - Ystad area, many last touched by Annika. The 30 leads for Annika around Muhanad Shikho went in: 7 new to Sydöst Ystad, 23 refreshed in place. Many old leads dial a registry number first, and some carry old names (AB FMGraphics as Kaptens Entreprenad & Allservice, Brenova i Skåne as Brenova Städ). Carolinas Hälsokost, By Nordiq and Upp eller Ner/AL Entertainment each have two companies on one address, check the sister before calling one fresh.

Mark kommun (Skene, Kinna, Örby, Fritsla, Horred, Sätila, Hyssna) sits in Göteborg - Borås, Bollebygd, Mark, Ulricehamn, Svenljunga, Tranemo (127132), bulk entered (leads 10564866xx-10564885xx) and dialled actively 28 Oct to 5 Nov 2026 (2026-11-05): of 354 checked, 62 were new, 105 in Adversus without a conversation (most with one short auto redial call), 187 worked. The 28 leads for Lina around Mark City, Industrigatan 2 (Kungsfors Center, Skene) went there: 7 new, 21 refreshed in place, all within 3.3 km. Kungsfors Center is a shopping and business centre, not an office hotel. Fresh leads beyond 3.3 km (Örby, Fritsla, Horred, Sätila, Hyssna) were not researched.

Tranemo and Svenljunga kommun along O 1581 and väg 156, Ambjörnarp to Svenljunga (2026-11-05): of 71 checked within about 6 km of the road, 12 were new, 25 in Adversus without a conversation, 34 worked. Almost all sit in Göteborg - Borås, Bollebygd, Mark, Ulricehamn, Svenljunga, Tranemo (127132), bulk entered in late October and auto redialled for a few seconds. The 27 leads for Vanessa around VIBO-Modulbyggen went there (5 new, 21 refreshed); ACE Protection sits in Göteborg - Göteborg (127128) with a Göteborg address. Several 1b leads carry other names (Connect Companies as Blue Integrator, J&L Bygg as Svenljunga Golv) or dial an old number first. Ambjörnarp to Svenljunga centrum is only 16 min, so the Goldilocks priority does not fit this pair.

Karlskrona around Gullberna (Gullbernavägen 1 D, 2026-11-05): of the 213 companies within about 3.4 km, 50 were new (most with no phone in registry or hitta), 88 in Adversus without a conversation, 75 worked. All hits sit in Sweden - Kronoberg/Blekinge (123308). Annika held private callbacks (set 2026-11-04) on 14 of the 1b leads, and Pål already had 8 callbacks there. The 20 leads for Pål went in: 6 new to Blekinge - Karlskrona, Ronneby, Karlshamn, Olofström, Sölvesborg (127190) on his choice, 14 refreshed in place. Prima Hemtjänst Blekinge (lead 1036697072) carries the old name Sopgumman and dials old numbers. JOBmeal Syd on Gullbernavägen 2 is a competitor.

Norrtälje kommun north of Norrtälje town (Väddö, Älmsta, Skebobruk, Edsbro, Hallstavik) is nearly untouched (2026-11-06): of the 466 companies within about 22 km of Broby gård 1 (Stabby Bygg), 458 were new, 5 in Adversus without a conversation, 3 worked. Postnummer search for 761, 763 and 764 returns nothing. The 30 leads went to Stockholm - Täby, Danderyd, Vallentuna, Österåker, Vaxholm, Norrtälje (127202): 15 for Vanessa, 15 for Lina. From Broby gård Hallstavik is 23-25 min, Norrtälje Stora Torget 27, Rimbo 37 and Rosättra 36. Central and south Norrtälje town was not researched.

Solna, Sundbyberg, Sollentuna and Danderyd, whole area (2026-11-05, filtered to leaders with a sonorant name score of 0.80 or more on the booker's request): of 365 checked, 111 were new, 89 in Adversus without a conversation, 165 worked. Solna and Sundbyberg leads sit in Stockholm - Stockholm, Solna, Sundbyberg, Ekerö (127198), bulk entered and dialled in September and October; many 1b there are Invalid after short calls. Sollentuna leads sit in Sweden - Stockholm Nord, bulk entered (1051484xxx-1051487xxx), mostly never dialled. Only 72 of 200 fresh rows had a number in allabolag or hitta. The 50 leads for Valon went in with fixed callbacks (25 on 2026-11-06 09:00, 25 on 2026-11-09 09:00): 10 new to 127198 and 123074, 40 refreshed in place. Four had the 046 fault (08 number stored as +4646). Frösundaviks Allé 1 (33 companies) and Sundbybergs torg 1 (Helio) are office hotels. Purspot AB, Dalvägen 16, runs vending machines: competitor.

Central Halmstad around Karlsbergsvägen 2A (Norre Katt and the old town, 2026-11-06): of the 135 companies within about 1.3 km, 34 were new, 36 in Adversus without a conversation, 65 worked. All hits sit in Sweden - Halmstad Syd. Most fresh ones have no phone in allabolag or hitta. The 15 leads for Annika around Lynx Hälsa went in: 4 new to Halmstad - Halmstad, Laholm, Båstad, Hylte (127195) on Pål's choice, 11 refreshed in place. Many old Halmstad Syd leads dial an old number first, and two had the 046 fault (035 number stored as +4646). Lili Doan set several of them Invalid after a 0 to 4 s call in August 2026. The old town is one-way streets: driving figures there say little, most rows are a short walk. A second ring at 1.3 to 3.2 km (the industrial areas by Spikgatan, Skyttevägen, Karlsrovägen and Furuviksringen) gave 28 new, 39 without a conversation and 68 worked of 135, and 15 more for Annika (2 new, 13 refreshed). hitta coordinates for 302 27 are off: they show about 0.6 km from the centre, but the road distance is 2.5 to 2.8 km.

Mariestad around Hantverkaregatan 7 (2026-11-06): of 211 companies in Mariestad kommun (3 to 50 employees), 142 were new, 12 in Adversus without a conversation, 57 worked. All hits sit in Sweden - Göteborg nord area, bulk entered and auto redialled in September and October. The 15 leads for Annika around Sjöstadens Kroppsteknik went in: 11 new to Sweden - Göteborg East on Pål's choice, 4 refreshed in place, all within 0.8 km. Sjöstadens Varv AB has an empty kommun in allabolag, so the kommun sweep misses it. Bianchi Vending Scandinavia AB, Hantverkaregatan 3, is a competitor.

Nybro kommun (2026-11-06): of 167 companies (3 to 50 employees), 35 were new, 122 in Adversus without a conversation, 10 worked. Nearly all hits sit in Sweden - Kalmar (bulk entered as Unprocessed, leads 10477xxxxx, never dialled). The 10 leads for Pål around EA Party Design, Storgatan 9C, went in: 1 new to Kalmar - Kalmar, Nybro, Mörbylånga, Borgholm, Emmaboda, Torsås (127191), 9 refreshed in place, all within 0.3 km. Several 1b leads dial another number first (Visioner Advokatbyrå rings its Lessebo office).

On 2026-11-06, 20 more for Pål from the next ring (Trossö centrum, about 3.1 to 3.5 km from Gullberna): of 198 more checked, 50 were new, 90 in Adversus without a conversation, 58 worked. 2 new to 127190, 18 refreshed in Sweden - Kronoberg/Blekinge. Some old leads carry other names (Mäklarbyrå Louise L as Carlshamnsmäklarna, Kungsplan Trafikskola as Karlskrona Trafikskola).
