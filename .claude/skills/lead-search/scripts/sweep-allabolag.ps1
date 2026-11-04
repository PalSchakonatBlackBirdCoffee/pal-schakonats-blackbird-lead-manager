# Sweeps the allabolag search, largest first, and lists every company with Min to Max employees.
# A query can be a kommun name (Simrishamn) or a postnummer without space (27261). A kommun name also
# matches companies elsewhere, so -Kommun keeps only companies whose registered kommun is in the list.
# Employee bands like 5-9 count by their lower bound, so 50-99 is out and 1-4 is out.
# Flag is filled for status remarks (konkurs, likvidation, fusion) and for churches (org.nr 252, församling).
# Input: -Query, optional -Kommun. Output: CSV with Foretag,Orgnr,Anstallda,Adress,Postnr,Ort,Kommun,Tel,Tel2,Mobil,Webb,Epost,Bransch,Flag,Lat,Lon.
# Lat and Lon are allabolag's own coordinates for the company, empty when it has none.
# Usage: & scripts/sweep-allabolag.ps1 -Query Simrishamn,Tomelilla -Kommun Simrishamn,Tomelilla -Out pool.csv

param([string[]]$Query, [string[]]$Kommun, [string]$Out, [int]$Min = 3, [int]$Max = 50)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
$rows = [ordered]@{}

foreach ($q in $Query) {
    for ($p = 1; $p -le 100; $p++) {
        $u = 'https://www.allabolag.se/bransch-s%C3%B6k?q=' + [uri]::EscapeDataString($q) + "&sort=numEmployeesDesc&page=$p"
        try { $html = (Invoke-WebRequest -Uri $u -UserAgent $ua -UseBasicParsing -TimeoutSec 20).Content } catch { Write-Output "ERROR $q page $p"; break }
        $json = [regex]::Match($html, '<script id="__NEXT_DATA__"[^>]*>(.*?)</script>').Groups[1].Value
        # The page has both "sources" and "Sources", which ConvertFrom-Json in PowerShell 5.1 refuses.
        $data = ($json -creplace '"Sources"', '"Sources_"') | ConvertFrom-Json
        $list = $data.props.pageProps.hydrationData.searchStore.companies.companies
        if (-not $list) { break }
        $anyBig = $false
        foreach ($c in $list) {
            $m = [regex]::Match([string]$c.employees, '\d+')
            $e = if ($m.Success) { [int]$m.Value } else { 0 }
            if ($e -ge $Min) { $anyBig = $true }
            if ($e -lt $Min -or $e -gt $Max) { continue }
            if ($Kommun -and $Kommun -notcontains $c.location.municipality) { continue }
            if ($rows.Contains($c.orgnr)) { continue }
            $flag = @()
            foreach ($r in @($c.statusRemarks)) { if ($r.desc) { $flag += $r.desc } }
            if ($c.orgnr -like '252*' -or $c.name -match 'församling|pastorat') { $flag += 'kyrka' }
            $xy = @($c.location.coordinates)[0]
            $rows[$c.orgnr] = [pscustomobject]@{
                Foretag = $c.name; Orgnr = $c.orgnr; Anstallda = [string]$c.employees
                Adress = $c.visitorAddress.addressLine; Postnr = $c.visitorAddress.zipCode; Ort = $c.visitorAddress.postPlace
                Kommun = $c.location.municipality; Tel = $c.phone; Tel2 = $c.phone2; Mobil = $c.mobile
                Webb = $c.homePage; Epost = $c.email; Bransch = $c.currentIndustry.name; Flag = ($flag -join '; ')
                Lat = $(if ($xy) { $xy.ycoordinate } else { '' }); Lon = $(if ($xy) { $xy.xcoordinate } else { '' })
            }
        }
        # Pages are sorted largest first: once a page has nobody at Min or above, the rest is smaller.
        if (-not $anyBig) { break }
        Start-Sleep -Milliseconds 900
    }
}

$rows.Values | Export-Csv -Path $Out -NoTypeInformation -Encoding UTF8
$flagged = @($rows.Values | Where-Object { $_.Flag }).Count
Write-Output "queries $($Query.Count), companies $($rows.Count), flagged $flagged"
