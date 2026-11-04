# Reads hitta.se for each org.nr: the company page gives phones, website and coordinates.
# With -Lat and -Lon (the anchor, from Google Maps) it adds the straight-line distance in km,
# so a mode 1 pool can be sorted nearest first before any research. Road distance is about 1.3 times it.
# Input: CSV with column Orgnr (digits, no dash). Output: CSV with Orgnr,Title,Phones,Web,Lat,Lon,Km,Hitta.
# Title carries the dashed org.nr, so a wrong match shows. Empty fields mean hitta had nothing, never a guess.
# Usage: & scripts/hitta.ps1 -In pool.csv -Out hitta.csv -Lat 55.5448348 -Lon 14.1772118

param([string]$In, [string]$Out, [double]$Lat, [double]$Lon)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

function Get-Page([string]$u) {
    try { return (Invoke-WebRequest -Uri $u -UserAgent $ua -UseBasicParsing -TimeoutSec 20).Content } catch { return '' }
}

$res = foreach ($row in (Import-Csv $In)) {
    $o = ($row.Orgnr -replace '\D', '')
    # The info page takes any slug and links to the company page, which holds phones and website.
    $info = Get-Page "https://www.hitta.se/f%C3%B6retagsinformation/x/$o"
    $link = [regex]::Match($info, 'href="(/verksamhet/[^"]+)"').Groups[1].Value
    $page = ''
    if ($link) { Start-Sleep -Milliseconds 600; $page = Get-Page ('https://www.hitta.se' + $link) }
    $geo = [regex]::Match($info + $page, 'image/v2/0/14/([\d.]+):([\d.]+)')
    $km = ''
    if ($geo.Success -and $Lat) {
        $dx = ([double]$geo.Groups[2].Value - $Lon) * 111.32 * [Math]::Cos($Lat * [Math]::PI / 180)
        $dy = ([double]$geo.Groups[1].Value - $Lat) * 110.57
        $km = [Math]::Round([Math]::Sqrt($dx * $dx + $dy * $dy), 1)
    }
    [pscustomobject]@{
        Orgnr  = $o
        Title  = [System.Net.WebUtility]::HtmlDecode([regex]::Match($page, '<title>(.*?)</title>').Groups[1].Value)
        Phones = (([regex]::Matches($page, 'tel:\s*\+46(\d+)') | ForEach-Object { '0' + $_.Groups[1].Value }) | Select-Object -Unique) -join ' '
        Web    = (([regex]::Matches($page, 'data-test="website"[^>]*data-census-details="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }) | Select-Object -Unique) -join ' '
        Lat    = $geo.Groups[1].Value
        Lon    = $geo.Groups[2].Value
        Km     = $km
        Hitta  = $(if ($link) { 'https://www.hitta.se' + $link } else { '' })
    }
    Start-Sleep -Milliseconds 600
}

$res | Export-Csv -Path $Out -NoTypeInformation -Encoding UTF8
$withPhone = @($res | Where-Object { $_.Phones }).Count
$withGeo = @($res | Where-Object { $_.Km -ne '' }).Count
Write-Output "rows $(@($res).Count), with a phone $withPhone, with a distance $withGeo"
