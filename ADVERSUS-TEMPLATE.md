# Adversus note template

What to write in the note on every lead in Adversus. Change it here, not in the skills.

## Format

One line, parts separated by ` ▸ `. Adversus removes line breaks, so never use them. Every part
opens with its own symbol, so the eye finds each part even in one long line. Leave out a part that
has nothing in it.

| # | Sweden | Denmark | What goes in it |
|---|---|---|---|
| 0 | `📍` | `📍` | The lead's town in capitals, the same value as the `By` field: `📍 VÄSTERÅS`. If the town is not the kommun's centralort, add `nära` / `nær` and the centralort: `📍 STRÖMSNÄSBRUK nära Markaryd`. The `By` field keeps only the town. Always first |
| 1 | `☎ RING` | `☎ RING` | The number to dial and who answers: a name and title, or the switchboard (`växeln` / `omstillingen`) |
| 2 | `➕ ÄVEN` | `➕ OGSÅ` | Every other verified number, `Name, title: ☎ number`, people separated by ` · `. Owner or CEO first, then others, then the switchboard |
| 2b | `👤 FRÅGA EFTER` | `👤 SPØRG EFTER` | Only when the website names nobody: the registered director, marked `enligt bolagsregistret` / `ifølge CVR` |
| 3 | `✉` | `✉` | The email address |
| 4 | `ℹ️ INFO` | `ℹ️ INFO` | Anything that changes the call or the drive: other visiting address, switchboard in another town, sister company on the same address, opening hours |
| 4b | `🚗` | `🚗` | Only on a list between two meetings: road km and minutes from meeting A and to meeting B, read from Google Maps, never estimated: `🚗 12 km, 14 min från AS Car's · 31 km, 33 min till Ulkeröds Gård` |
| 5 | `📋` | `📋` | The list and meeting the lead came from. Between two meetings, name both. Always last |

## Rules

- Name before number, always.
- `☎` before every phone number. In `☎ RING` the symbol opens the part.
- `✉` before every email address.
- Never repeat the `☎ RING` person under `➕ ÄVEN` / `➕ OGSÅ`.
- Include every verified number.

## Examples

Sweden, with named contacts:

```
📍 HEDARED nära Borås ▸ ☎ RING 033-23 37 51 till Eric Bengtsson, VD ▸ ➕ ÄVEN Barbro Hansson, ekonomi och kundtjänst: ☎ 033-23 37 57 · Andreas Gustafsson, arbetsledare: ☎ 033-23 37 50 ▸ ✉ eric@ssel.se ▸ 📋 Ringlista Hedared 2026-09-17, möte ICA Nära Hedared fre 18/9 13:30
```

Sweden, nobody named on the web:

```
📍 KALMAR ▸ ☎ RING 0480-883 00 till växeln ▸ 👤 FRÅGA EFTER Jörgen Bogren, VD enligt bolagsregistret (inget direktnummer) ▸ ✉ info@moremaskiner.se ▸ 📋 Ringlista Kalmar Hansa 2026-10-13, möte Jannes Däck & Fälg ons 14/10 10:30
```

Sweden, with something that changes the visit:

```
📍 VÄSTERÅS ▸ ☎ RING 021-13 62 22 till växeln ▸ 👤 FRÅGA EFTER Johan Sjöqvist, VD enligt bolagsregistret (inget direktnummer) ▸ ℹ️ INFO Systerbolag Tullhuset Living på samma adress ▸ 📋 Ringlista Västerås 2026-10-27, möte ReKonik AB tor 29/10 15:00
```

Sweden, between two meetings:

```
📍 <ORT> nära <centralort> ▸ ☎ RING <nummer> till <namn, titel> ▸ ➕ ÄVEN <namn, titel>: ☎ <nummer> ▸ ✉ <e-post> ▸ 🚗 <X> km, <X> min från <möte A> · <X> km, <X> min till <möte B> ▸ 📋 Ringlista <A>-<B> <datum>, möten <möte A> <dag> <tid> och <möte B> <dag> <tid>
```

Denmark (to confirm on the first Danish run):

```
📍 <BY> nær <hovedby> ▸ ☎ RING <nummer> til <navn, titel> ▸ ➕ OGSÅ <navn, titel>: ☎ <nummer> · omstilling: ☎ <nummer> ▸ ✉ <adresse> ▸ 📋 Ringeliste <by> <dato>, møde <virksomhed> <dag> <tid>
```

```
📍 <BY> ▸ ☎ RING <nummer> til omstillingen ▸ 👤 SPØRG EFTER <navn>, direktør ifølge CVR (intet direkte nummer) ▸ 📋 Ringeliste <by> <dato>
```

```
📍 <BY> ▸ ☎ RING <nummer> til <navn, titel> ▸ 🚗 <X> km, <X> min fra <møde A> · <X> km, <X> min til <møde B> ▸ 📋 Ringeliste <A>-<B> <dato>, møder <møde A> <dag> <tid> og <møde B> <dag> <tid>
```
