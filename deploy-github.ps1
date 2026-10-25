<#
  一键部署到 GitHub Pages
  用法：
    1) 在 https://github.com/settings/tokens 生成 classic token（勾选 repo 范围）
    2) 保存到 %USERPROFILE%\.gh-token（一行，只有 token）
    3) 在本目录运行：  powershell -ExecutionPolicy Bypass -File .\deploy-github.ps1
  说明：脚本自动创建公开仓库、推送当前目录、开启 Pages，并输出访问地址。
#>
param(
  [string]$Token = '',
  [string]$RepoName = '306-medloop',
  [int]$WaitSeconds = 240
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not $Token) {
  $tokenFile = Join-Path $env:USERPROFILE '.gh-token'
  Write-Host "等待 token 文件：$tokenFile （最多 $WaitSeconds 秒）..." -ForegroundColor Yellow
  $deadline = (Get-Date).AddSeconds($WaitSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-Path $tokenFile) {
      $Token = (Get-Content $tokenFile -Raw).Trim()
      if ($Token) { break }
    }
    Start-Sleep -Seconds 3
  }
}
if (-not $Token) { Write-Host '没有找到 token，退出。' -ForegroundColor Red; exit 2 }

$headers = @{
  Authorization = "token $Token"
  'User-Agent'  = 'medloop-deploy'
  Accept        = 'application/vnd.github+json'
}

Write-Host '验证 token...' -ForegroundColor Cyan
$me = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $headers -TimeoutSec 20
$login = $me.login
Write-Host "  账号：$login" -ForegroundColor Green

Write-Host '检查 / 创建仓库...' -ForegroundColor Cyan
$repoFull = "$login/$RepoName"
$exists = $true
try { $repo = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoFull" -Headers $headers -TimeoutSec 20 } catch { $exists = $false }
if (-not $exists) {
  $body = @{
    name        = $RepoName
    description = '306 西综个性化训练台：静态单页，632 题 / 203 考点 / 多题源变式'
    private     = $false
    has_issues  = $false
  } | ConvertTo-Json
  $repo = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/user/repos' -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 30
  Write-Host "  已创建：$($repo.full_name)" -ForegroundColor Green
} else {
  Write-Host "  已存在：$($repo.full_name)" -ForegroundColor Green
}

Write-Host '推送代码...' -ForegroundColor Cyan
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("x-access-token:$Token"))
git -c http.extraheader="AUTHORIZATION: basic $b64" push --force "https://github.com/$repoFull.git" "main:main"
if ($LASTEXITCODE -ne 0) { Write-Host '推送失败，检查 token 是否有 repo 权限。' -ForegroundColor Red; exit 1 }
git remote remove origin 2>$null | Out-Null
git remote add origin "https://github.com/$repoFull.git"
git remote set-url origin "https://github.com/$repoFull.git"

Write-Host '开启 GitHub Pages...' -ForegroundColor Cyan
$pagesBody = @{ source = @{ branch = 'main'; path = '/' } } | ConvertTo-Json
try {
  $pages = Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$repoFull/pages" -Headers $headers -Body $pagesBody -ContentType 'application/json' -TimeoutSec 30
  Write-Host "  Pages 已开启：" -ForegroundColor Green
} catch {
  Write-Host '  Pages 已存在或创建被拒，尝试读取现有配置…' -ForegroundColor Yellow
}
try { $pages = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoFull/pages" -Headers $headers -TimeoutSec 20 } catch { $pages = $null }
$siteUrl = if ($pages -and $pages.html_url) { $pages.html_url } else { "https://$login.github.io/$RepoName/" }

Write-Host "等待页面构建（通常 30~90 秒）..." -ForegroundColor Cyan
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
  Write-Host "部署完成：$siteUrl" -ForegroundColor Green
  Write-Host "以后更新：提交后执行  git push  （或用本脚本重跑）" -ForegroundColor Gray
} else {
  Write-Host ''
  Write-Host "已推送并开启 Pages，但页面还在构建。稍后访问：$siteUrl" -ForegroundColor Yellow
}
