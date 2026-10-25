<#
  One-click deploy to GitHub Pages.
  Usage:
    1) Create a classic token at https://github.com/settings/tokens (scope: repo)
    2) Save it to %USERPROFILE%\.gh-token (single line, no quotes)
    3) Run:  pwsh -ExecutionPolicy Bypass -File .\deploy-github.ps1
  The script creates a public repo, pushes this folder, enables Pages and prints the URL.
#>
param(
  [string]$Token = '',
  [string]$RepoName = '306-medloop',
  [int]$WaitSeconds = 240
)
$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not $Token) {
  $tokenFile = Join-Path $env:USERPROFILE '.gh-token'
  Write-Host "Waiting for token file: $tokenFile (up to $WaitSeconds s)..." -ForegroundColor Yellow
  $deadline = (Get-Date).AddSeconds($WaitSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-Path $tokenFile) {
      $Token = (Get-Content $tokenFile -Raw).Trim()
      if ($Token) { break }
    }
    Start-Sleep -Seconds 3
  }
}
if (-not $Token) { Write-Host 'Token not found. Exit.' -ForegroundColor Red; exit 2 }

$headers = @{
  Authorization = "token $Token"
  'User-Agent'  = 'medloop-deploy'
  Accept        = 'application/vnd.github+json'
}

Write-Host 'Validating token...' -ForegroundColor Cyan
$me = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $headers -TimeoutSec 20
$login = $me.login
Write-Host "  account: $login" -ForegroundColor Green

Write-Host 'Checking / creating repository...' -ForegroundColor Cyan
$repoFull = "$login/$RepoName"
$exists = $true
try { $repo = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoFull" -Headers $headers -TimeoutSec 20 } catch { $exists = $false }
if (-not $exists) {
  $payload = [ordered]@{
    name        = $RepoName
    description = '306 medloop: static single-page trainer, 632 questions / 203 knowledge points'
    private     = $false
    has_issues  = $false
  } | ConvertTo-Json
  $repo = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/user/repos' -Headers $headers -Body $payload -ContentType 'application/json' -TimeoutSec 30
  Write-Host "  created: $($repo.full_name)" -ForegroundColor Green
} else {
  Write-Host "  exists: $($repo.full_name)" -ForegroundColor Green
}

Write-Host 'Pushing code...' -ForegroundColor Cyan
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("x-access-token:$Token"))
git -c http.extraheader="AUTHORIZATION: basic $b64" push --force "https://github.com/$repoFull.git" "main:main"
if ($LASTEXITCODE -ne 0) { Write-Host 'Push failed. Check token repo scope.' -ForegroundColor Red; exit 1 }
$ErrorActionPreference = 'Continue'
git remote remove origin 2>&1 | Out-Null
git remote add origin "https://github.com/$repoFull.git" 2>&1 | Out-Null
$ErrorActionPreference = 'Stop'

Write-Host 'Enabling GitHub Pages...' -ForegroundColor Cyan
$pagesBody = [ordered]@{ source = [ordered]@{ branch = 'main'; path = '/' } } | ConvertTo-Json
try {
  $pages = Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$repoFull/pages" -Headers $headers -Body $pagesBody -ContentType 'application/json' -TimeoutSec 30
  Write-Host '  Pages enabled.' -ForegroundColor Green
} catch {
  Write-Host '  Pages may already exist, reading config...' -ForegroundColor Yellow
}
$pages = $null
try { $pages = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoFull/pages" -Headers $headers -TimeoutSec 20 } catch { }
$siteUrl = if ($pages -and $pages.html_url) { $pages.html_url } else { "https://$login.github.io/$RepoName/" }

Write-Host "Waiting for build (30-90s): $siteUrl" -ForegroundColor Cyan
$ok = $false
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 5
  try {
    $res = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 10
    if ($res.StatusCode -eq 200) { $ok = $true; break }
  } catch { }
}
if ($ok) {
  Write-Host ''
  Write-Host "DEPLOYED: $siteUrl" -ForegroundColor Green
  Write-Host "Update later: git push (needs token again)" -ForegroundColor Gray
} else {
  Write-Host ''
  Write-Host "Pushed and Pages enabled, still building. Visit later: $siteUrl" -ForegroundColor Yellow
}
