# Push current branch to GitHub (uses token file %USERPROFILE%\.gh-token)
param([string]$Message = 'update', [string]$Remote = 'origin', [string]$Branch = 'main')
$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$tokenFile = Join-Path $env:USERPROFILE '.gh-token'
if (-not (Test-Path $tokenFile)) { Write-Host "Missing token file: $tokenFile" -ForegroundColor Red; exit 2 }
$token = (Get-Content $tokenFile -Raw).Trim()
if (-not $token) { Write-Host 'Token file empty.' -ForegroundColor Red; exit 2 }

git add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'No changes to commit.' -ForegroundColor Yellow } else {
  git commit -m $Message | Out-Null
  Write-Host "Committed: $Message" -ForegroundColor Green
}
$url = (git remote get-url $Remote)
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("x-access-token:$token"))
$ErrorActionPreference = 'Continue'
git -c http.extraheader="AUTHORIZATION: basic $b64" push $Remote $Branch 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { Write-Host 'Push failed.' -ForegroundColor Red; exit 1 }
Write-Host "Pushed to $url ($Branch)" -ForegroundColor Green
Write-Host 'GitHub Pages will rebuild in ~30-90s.'
