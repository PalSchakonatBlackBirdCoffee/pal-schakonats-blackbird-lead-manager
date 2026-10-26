# Adversus note template

What to write in the note on every lead in Adversus. Change it here, not in the skills.

## Format

One line, parts separated by ` | `. Adversus removes line breaks, so never use them. Leave out a
part that has nothing in it.

Every phone number starts with `☎`. The email address starts with `✉`.

| # | Sweden | Denmark | What goes in it |
|---|---|---|---|
| 1 | `RING: ☎` | `RING: ☎` | The number to dial and who answers: a name and title, or the switchboard (`växeln` / `omstillingen`) |
| 2 | `ÄVEN:` | `OGSÅ:` | Every other verified number, `Name, title: ☎ number`. Owner or CEO first, then others, then the switchboard |
| 2b | `FRÅGA EFTER:` | `SPØRG EFTER:` | Only when the website names nobody: the registered director, marked `enligt bolagsregistret` / `ifølge CVR` |
| 3 | `✉` | `✉` | The email address |
| 4 | `INFO:` | `INFO:` | Anything that changes the call or the drive (other visiting address, switchboard in another town, sister company on the same address, opening hours), then the list and meeting the lead came from |

## Rules

- Name before number, always.
- `☎` before every phone number, `✉` before every email address.
- Never repeat the `RING:` person under `ÄVEN:` / `OGSÅ:`.
- Include every verified number.

## Examples

Sweden, with named contacts:

```
RING: ☎ 033-23 37 51 till Eric Bengtsson, VD | ÄVEN: Barbro Hansson, ekonomi och kundtjänst: ☎ 033-23 37 57 | Andreas Gustafsson, arbetsledare: ☎ 033-23 37 50 | ✉ eric@ssel.se | INFO: Ringlista Hedared 2026-09-17, möte ICA Nära Hedared fre 18/9 13:30
```

Sweden, nobody named on the web:

```
RING: ☎ 0480-883 00 till växeln | FRÅGA EFTER: Jörgen Bogren, VD enligt bolagsregistret (inget direktnummer) | ✉ info@moremaskiner.se | INFO: Ringlista Kalmar Hansa 2026-10-13, möte Jannes Däck & Fälg ons 14/10 10:30
```

Denmark (to confirm on the first Danish run):

```
RING: ☎ <nummer> til <navn, titel> | OGSÅ: <navn, titel>: ☎ <nummer> | omstilling: ☎ <nummer> | ✉ <adresse> | INFO: Ringeliste <by> <dato>, møde <virksomhed> <dag> <tid>
```

```
RING: ☎ <nummer> til omstillingen | SPØRG EFTER: <navn>, direktør ifølge CVR (intet direkte nummer) | INFO: Ringeliste <by> <dato>
```
