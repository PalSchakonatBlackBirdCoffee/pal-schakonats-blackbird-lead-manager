# Flags org.nr and Swedish phone numbers that cannot be right. Sweden only: Danish CVR and numbers are not checked.
# Never corrects anything. A pass proves the string is well formed, not that it belongs to the company.
# Usage: powershell -File digits.ps1 <file.md> [<file.md> ...]

param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Paths)

function Test-Luhn([string]$d) {
    $sum = 0
    for ($i = 0; $i -lt $d.Length; $i++) {
        $n = [int][string]$d[$i]
        if ($i % 2 -eq 0) { $n *= 2; if ($n -gt 9) { $n -= 9 } }
        $sum += $n
    }
    return ($sum % 10 -eq 0)
}

function Test-Phone([string]$raw) {
    $d = $raw -replace '[^\d+]', ''
    if ($d.StartsWith('+46')) { $d = '0' + $d.Substring(3) }
    if (-not $d.StartsWith('0')) { return 'does not start with 0 or +46' }
    if ($d -match '^07') { if ($d.Length -ne 10) { return "mobile with $($d.Length) digits" } return '' }
    if ($d.Length -lt 8 -or $d.Length -gt 10) { return "$($d.Length) digits" }
    return ''
}

$orgRe = [regex]'\b\d{6}-\d{4}\b'
# Swedish phone shapes as written in the lists: 0370-69 95 50, 070-291 87 60, 08-560 387 00, +46 370 65 66 00
$telRe = [regex]'(?<![\d-])(?:\+46[\s\d]{8,14}\d|0\d{1,3}-[\d ]{4,10}\d)(?![\d-])'

$rows = 0; $orgs = 0; $tels = 0; $bad = @()
foreach ($p in $Paths) {
    $name = Split-Path $p -Leaf
    foreach ($line in (Get-Content -LiteralPath $p -Encoding UTF8)) {
        if (-not $line.StartsWith('|') -or $line.StartsWith('|---')) { continue }
        $rows++
        foreach ($m in $orgRe.Matches($line)) {
            $orgs++
            $d = $m.Value -replace '-', ''
            if (-not (Test-Luhn $d)) { $bad += "$name | org.nr $($m.Value) fails Luhn" }
        }
        foreach ($m in $telRe.Matches($line)) {
            $tels++
            $why = Test-Phone $m.Value
            if ($why) { $bad += "$name | phone '$($m.Value.Trim())' $why" }
        }
    }
}
"files $($Paths.Count), table rows $rows, org.nr $orgs, phones $tels, flagged $($bad.Count)"
$bad
