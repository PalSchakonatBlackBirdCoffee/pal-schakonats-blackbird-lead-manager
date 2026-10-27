# Reads a company's own site and lists the phone numbers and emails on it.
# Fetches the home page, then up to 3 contact/about pages linked from it. No model involved.
# Input: CSV with columns Name,Url. Output: CSV with Name,Url,Pages,Phones,Emails,Error.
# Usage: powershell -File get-site-contacts.ps1 -In sites.csv -Out found.csv

param([string]$In, [string]$Out)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

function Get-Page([string]$u) {
    try { return (Invoke-WebRequest -Uri $u -UserAgent $ua -UseBasicParsing -TimeoutSec 15).Content } catch { return $null }
}

function Get-Phones([string]$html) {
    $set = New-Object System.Collections.Generic.HashSet[string]
    foreach ($m in [regex]::Matches($html, 'href="tel:([^"]+)"')) { [void]$set.Add($m.Groups[1].Value) }
    $text = [regex]::Replace($html, '<script[\s\S]*?</script>|<style[\s\S]*?</style>', ' ')
    $text = [regex]::Replace($text, '<[^>]+>', ' ')
    $text = [System.Net.WebUtility]::HtmlDecode($text)
    foreach ($m in [regex]::Matches($text, '(?<![\d])(?:\+46\s?(?:\(0\))?\s?|0)\d{1,3}[\s\-/]?\d{1,3}(?:[\s\-]?\d{2,3}){1,3}(?![\d])')) { [void]$set.Add($m.Value) }
    $out = @()
    foreach ($p in $set) {
        $d = ([uri]::UnescapeDataString($p)) -replace '[^\d+]', ''
        $d = $d -replace '^\+460', '0' -replace '^\+46', '0' -replace '^0046', '0'
        if ($d -match '^0\d{7,9}$') { $out += $d }
    }
    return $out | Select-Object -Unique
}

function Get-Emails([string]$html) {
    $html = [System.Net.WebUtility]::HtmlDecode($html)
    return [regex]::Matches($html, '[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}') | ForEach-Object { $_.Value.ToLower() } |
        Where-Object { $_ -notmatch '\.(png|jpg|jpeg|gif|webp|svg)$' -and $_ -notmatch 'sentry|wixpress|example\.' } | Select-Object -Unique
}

$rows = Import-Csv $In -Encoding UTF8
$result = foreach ($r in $rows) {
    $front = Get-Page $r.Url
    if (-not $front) { [pscustomobject]@{Name=$r.Name; Url=$r.Url; Pages=0; Phones=''; Emails=''; Error='home page did not load'}; continue }
    $base = [uri]$r.Url
    $links = [regex]::Matches($front, 'href="([^"#]+)"') | ForEach-Object { $_.Groups[1].Value } |
        Where-Object { $_ -match 'kontakt|contact|om-oss|about|personal|medarbetare|team' } |
        ForEach-Object { try { ([uri]::new($base, $_)).AbsoluteUri } catch {} } |
        Where-Object { ([uri]$_).Host -eq $base.Host } | Select-Object -Unique -First 3
    $html = $front; $n = 1
    foreach ($l in $links) { $p = Get-Page $l; if ($p) { $html += $p; $n++ }; Start-Sleep -Milliseconds 300 }
    [pscustomobject]@{Name=$r.Name; Url=$r.Url; Pages=$n; Phones=((Get-Phones $html) -join ' '); Emails=((Get-Emails $html) -join ' '); Error=''}
}
$result | Export-Csv $Out -NoTypeInformation -Encoding UTF8
"sites $($rows.Count), loaded $(@($result | ? { $_.Pages -gt 0 }).Count), with a phone $(@($result | ? { $_.Phones }).Count)"
