# Matches Google Maps names to registry rows, address first, without a model.
# Sure:      same normalised name, or same street address and a shared name word.
# Candidate: same street address, no shared name word. Only these need a model or a human.
# Input: Maps CSV (Namn, Adress) and registry CSV (Foretag, Orgnr, Adress). Output: Maps rows with Match, Orgnr, Kind.
# Usage: powershell -File match-registry.ps1 -Maps maps.csv -Registry registry.csv -Out matched.csv -Town Malmö
# -Town is the area's town. It is dropped from names, so "Scanfil Malmö" and "Scanfil" compare equal.

param([string]$Maps, [string]$Registry, [string]$Out, [string]$Town = '')

$stop = @('ab', 'aktiebolag', 'aktiebolaget', 'hb', 'kb', 'i', 'och', 'and', 'the', 'sverige', 'sweden', 'nordic', 'group', 'service', 'services', 'company')

function Fold([string]$s) {
    $s = $s.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
    return ([regex]::Replace($s, '\p{Mn}', '')) -replace '[^a-z0-9 ]', ' ' -replace '\s+', ' '
}
function NameKey([string]$s) { ((Fold $s).Split(' ') | Where-Object { $_ -and $stop -notcontains $_ }) -join ' ' }
function Words([string]$s) { (NameKey $s).Split(' ') | Where-Object { $_.Length -ge 3 } }
function AddrKey([string]$s) {
    $street = (Fold ($s.Split(',')[0])).Trim()
    $m = [regex]::Match($street, '^(.*?)\s*(\d+)')
    if ($m.Success) { return "$($m.Groups[1].Value.Trim()) $($m.Groups[2].Value)" }
    return $street
}

if ($Town) { $stop += (Fold $Town).Trim().Split(' ') }

$reg = Import-Csv $Registry -Encoding UTF8
$byName = @{}; $byAddr = @{}
foreach ($r in $reg) {
    $nk = NameKey $r.Foretag; if ($nk -and -not $byName.ContainsKey($nk)) { $byName[$nk] = $r }
    $ak = AddrKey $r.Adress; if (-not $byAddr.ContainsKey($ak)) { $byAddr[$ak] = @() }; $byAddr[$ak] += $r
}

$rows = foreach ($m in (Import-Csv $Maps -Encoding UTF8)) {
    $hit = $null; $kind = 'none'
    $nk = NameKey $m.Namn
    if ($nk -and $byName.ContainsKey($nk)) { $hit = $byName[$nk]; $kind = 'sure, name' }
    else {
        $ak = AddrKey $m.Adress; $here = if ($byAddr.ContainsKey($ak)) { @($byAddr[$ak]) } else { @() }
        if ($here.Count -gt 0) {
            $w = @(Words $m.Namn)
            $shared = @($here | Where-Object { $rw = @(Words $_.Foretag); @($w | Where-Object { $rw -contains $_ }).Count -gt 0 })
            if ($shared.Count -eq 1) { $hit = $shared[0]; $kind = 'sure, address and name word' }
            elseif ($here.Count -le 3) { $kind = "candidate, $($here.Count) at address" ; $hit = [pscustomobject]@{Foretag = ($here.Foretag -join ' / '); Orgnr = ($here.Orgnr -join ' / ')} }
            else { $kind = "address has $($here.Count) companies" }
        }
    }
    [pscustomobject]@{Namn = $m.Namn; Adress = $m.Adress; Match = $hit.Foretag; Orgnr = $hit.Orgnr; Kind = $kind}
}
$rows | Export-Csv $Out -NoTypeInformation -Encoding UTF8
$rows | Group-Object Kind | Sort-Object Count -Descending | ForEach-Object { "$($_.Count)`t$($_.Name)" }
