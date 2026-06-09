# Builds data/db.json from Sinistros.xlsx and Vitimas.xlsx using Excel COM.
# READ-ONLY on the xlsx files. Run only when source data changes.
$ErrorActionPreference = 'Stop'

$SINISTROS = 'C:\Users\Admin\Documents\Sinistros.xlsx'
$VITIMAS   = 'C:\Users\Admin\Documents\Vitimas.xlsx'
$OUT       = Join-Path $PSScriptRoot 'db.json'

function To-Title([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return $s }
  $ti = (Get-Culture).TextInfo
  $t = $ti.ToTitleCase($s.ToLower())
  # Lowercase Portuguese connectors mid-word
  $connectors = @('De','Da','Do','Das','Dos','E')
  $parts = $t -split ' '
  for ($i = 1; $i -lt $parts.Length; $i++) {
    if ($connectors -contains $parts[$i]) { $parts[$i] = $parts[$i].ToLower() }
  }
  return ($parts -join ' ')
}

function Get-Val($ws, [int]$r, [int]$c) {
  $v = $ws.Cells.Item($r, $c).Value2
  if ($null -eq $v) { return $null }
  return $v
}

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
  # ---------- Sinistros.xlsx ----------
  $wbS = $excel.Workbooks.Open($SINISTROS, 0, $true)

  $p1 = $wbS.Worksheets.Item(1)
  $p2 = $wbS.Worksheets.Item(2)
  $p3 = $wbS.Worksheets.Item(3)

  $totSinistros        = [int](Get-Val $p1 4 1)
  $totSinistrosComVit  = [int](Get-Val $p1 4 3)
  $totSinistrosSemVit  = [int](Get-Val $p1 4 5)

  # Painel 1 - Regiões (col 1 nome, col 2 total) - linhas 8..13
  $regioes = @()
  for ($r = 8; $r -le 13; $r++) {
    $nome = Get-Val $p1 $r 1
    if (-not $nome) { continue }
    $regioes += [pscustomobject]@{
      nome     = To-Title $nome
      sinistros = [int](Get-Val $p1 $r 2)
    }
  }

  # Painel 1 - Ranking municípios (col 5 nome, col 6 total) - linhas 8..86, excluindo "SEM INFORMAÇÃO" e "Total"
  $sinistrosPorMunicipio = @{}
  for ($r = 8; $r -le 86; $r++) {
    $nome = Get-Val $p1 $r 5
    if (-not $nome) { continue }
    $upper = $nome.ToString().ToUpper().Trim()
    if ($upper -like 'SEM INFORMA*' -or $upper -eq 'TOTAL') { continue }
    $sinistrosPorMunicipio[(To-Title $nome)] = [int](Get-Val $p1 $r 6)
  }

  # Painel 2 - Gravidade (linhas 8..13 col 1+2)
  $gravidade = @()
  for ($r = 8; $r -le 13; $r++) {
    $lbl = Get-Val $p2 $r 1
    if (-not $lbl -or $lbl -eq 'Total') { continue }
    $gravidade += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $p2 $r 2)
    }
  }

  # Painel 2 - Veículos (linhas 8..18 col 4+5)
  $veiculos = @()
  for ($r = 8; $r -le 18; $r++) {
    $lbl = Get-Val $p2 $r 4
    if (-not $lbl -or $lbl -eq 'Total') { continue }
    $veiculos += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $p2 $r 5)
    }
  }

  # Painel 2 - Tipo de Acidente (linhas 8..18 col 7+8)
  $tiposAcidente = @()
  for ($r = 8; $r -le 18; $r++) {
    $lbl = Get-Val $p2 $r 7
    if (-not $lbl -or $lbl -eq 'Total') { continue }
    $tiposAcidente += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $p2 $r 8)
    }
  }

  # Painel 2 - Via (linhas 8..12 col 10+11)
  $vias = @()
  for ($r = 8; $r -le 12; $r++) {
    $lbl = Get-Val $p2 $r 10
    if (-not $lbl -or $lbl -eq 'Total') { continue }
    $vias += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $p2 $r 11)
    }
  }

  # Painel 3 - Mês x Fase do dia (cols 1..7) e Mês x Gravidade (cols 9..13) - linhas 8..19
  $mensal = @()
  for ($r = 8; $r -le 19; $r++) {
    $mes = Get-Val $p3 $r 1
    if (-not $mes) { continue }
    $mensal += [pscustomobject]@{
      mes         = (To-Title $mes)
      amanhecer   = [int](Get-Val $p3 $r 2)
      plenoDia    = [int](Get-Val $p3 $r 3)
      anoitecer   = [int](Get-Val $p3 $r 4)
      plenaNoite  = [int](Get-Val $p3 $r 5)
      semInfo     = [int](Get-Val $p3 $r 6)
      total       = [int](Get-Val $p3 $r 7)
      semVitima   = [int](Get-Val $p3 $r 10)
      parcial     = [int](Get-Val $p3 $r 11)
      fatal       = [int](Get-Val $p3 $r 12)
    }
  }

  $wbS.Close($false)

  # ---------- Vitimas.xlsx ----------
  $wbV = $excel.Workbooks.Open($VITIMAS, 0, $true)
  $pv = $wbV.Worksheets.Item(1)

  $totVitimas         = [int](Get-Val $pv 2 1)
  $totVitimasParciais = [int](Get-Val $pv 2 2)
  $totVitimasFatais   = [int](Get-Val $pv 2 3)

  # Vítimas por tipo (linhas 6..7 col 1+2)
  $vitimasTipo = @()
  for ($r = 6; $r -le 7; $r++) {
    $lbl = Get-Val $pv $r 1
    if (-not $lbl) { continue }
    $vitimasTipo += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $pv $r 2)
    }
  }

  # Vítimas por gênero (linhas 6..8 col 5+6)
  $vitimasGenero = @()
  for ($r = 6; $r -le 8; $r++) {
    $lbl = Get-Val $pv $r 5
    if (-not $lbl) { continue }
    $vitimasGenero += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $pv $r 6)
    }
  }

  # Vítimas por faixa etária (linhas 6..15 col 9+10)
  $vitimasFaixa = @()
  for ($r = 6; $r -le 15; $r++) {
    $lbl = Get-Val $pv $r 9
    if (-not $lbl) { continue }
    $vitimasFaixa += [pscustomobject]@{
      label = $lbl
      total = [int](Get-Val $pv $r 10)
    }
  }

  # Vítimas fatais por óbito (linhas 6..8 col 12+13)
  $vitimasObito = @()
  for ($r = 6; $r -le 8; $r++) {
    $lbl = Get-Val $pv $r 12
    if (-not $lbl) { continue }
    $vitimasObito += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $pv $r 13)
    }
  }

  # Vítimas fatais por gênero (linhas 20..21 col 5+6)
  $vitimasFataisGenero = @()
  for ($r = 20; $r -le 21; $r++) {
    $lbl = Get-Val $pv $r 5
    if (-not $lbl) { continue }
    $vitimasFataisGenero += [pscustomobject]@{
      label = (To-Title $lbl)
      total = [int](Get-Val $pv $r 6)
    }
  }

  # Vítimas fatais mensais (linhas 20..31 col 9+10)
  $fataisMensais = @()
  for ($r = 20; $r -le 31; $r++) {
    $mes = Get-Val $pv $r 9
    if (-not $mes) { continue }
    $fataisMensais += [pscustomobject]@{
      mes    = (To-Title $mes)
      fatais = [int](Get-Val $pv $r 10)
    }
  }

  # Fatalidades por município (linhas 30..108 col 1+2), excluir SEM INFORMAÇÃO e Total
  $fatalidadesPorMunicipio = @{}
  for ($r = 30; $r -le 108; $r++) {
    $nome = Get-Val $pv $r 1
    if (-not $nome) { continue }
    $upper = $nome.ToString().ToUpper().Trim()
    if ($upper -like 'SEM INFORMA*' -or $upper -eq 'TOTAL') { continue }
    $fatalidadesPorMunicipio[(To-Title $nome)] = [int](Get-Val $pv $r 2)
  }

  $wbV.Close($false)

  # ---------- Merge: municípios (sinistros + fatalidades) ----------
  $allCities = New-Object 'System.Collections.Generic.HashSet[string]'
  $sinistrosPorMunicipio.Keys | ForEach-Object { [void]$allCities.Add($_) }
  $fatalidadesPorMunicipio.Keys | ForEach-Object { [void]$allCities.Add($_) }

  $municipios = @()
  foreach ($nome in $allCities) {
    $sin = 0; $fat = 0
    if ($sinistrosPorMunicipio.ContainsKey($nome))   { $sin = $sinistrosPorMunicipio[$nome] }
    if ($fatalidadesPorMunicipio.ContainsKey($nome)) { $fat = $fatalidadesPorMunicipio[$nome] }
    $risco = if ($sin -ge 5000) { 'alto' } elseif ($sin -ge 1000) { 'medio' } else { 'baixo' }
    $municipios += [pscustomobject]@{
      nome        = $nome
      sinistros   = $sin
      fatalidades = $fat
      risco       = $risco
    }
  }
  $municipios = $municipios | Sort-Object -Property sinistros -Descending

  # ---------- Build final object ----------
  $db = [pscustomobject]@{
    meta = [pscustomobject]@{
      fontes       = @('DETRAN|ES', 'PRF')
      periodo      = 'Acumulado 2024-2025'
      atualizacao  = 'Dezembro de 2025'
      observacao   = 'Dados consolidados a partir dos boletins de ocorrência integrados.'
    }
    totais = [pscustomobject]@{
      sinistros            = $totSinistros
      sinistrosComVitimas  = $totSinistrosComVit
      sinistrosSemVitimas  = $totSinistrosSemVit
      vitimasTotal         = $totVitimas
      vitimasParciais      = $totVitimasParciais
      vitimasFatais        = $totVitimasFatais
      municipios           = $municipios.Count
    }
    regioes              = $regioes
    gravidade            = $gravidade
    veiculos             = $veiculos
    tiposAcidente        = $tiposAcidente
    vias                 = $vias
    mensal               = $mensal
    vitimasTipo          = $vitimasTipo
    vitimasGenero        = $vitimasGenero
    vitimasFaixaEtaria   = $vitimasFaixa
    vitimasFataisObito   = $vitimasObito
    vitimasFataisGenero  = $vitimasFataisGenero
    fataisMensais        = $fataisMensais
    municipios           = $municipios
  }

  $json = $db | ConvertTo-Json -Depth 8
  [System.IO.File]::WriteAllText($OUT, $json, [System.Text.UTF8Encoding]::new($false))
  Write-Output "Wrote $OUT  (municipios: $($municipios.Count))"
}
finally {
  $excel.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
