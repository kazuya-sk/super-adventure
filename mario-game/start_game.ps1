# スーパーアドベンチャー 起動スクリプト
# このスクリプトを実行すると、ゲームがブラウザで開きます。

$HTMLPath = Join-Path $PSScriptRoot "index.html"
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   SUPER ADVENTURE - スーパーアドベンチャー   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "ゲームを起動しています..." -ForegroundColor White

# Pythonが利用可能かチェックします（ローカルサーバー起動用）
$PythonCmd = Get-Command python -ErrorAction SilentlyContinue

if ($PythonCmd) {
    Write-Host "Pythonのローカルサーバーを起動しています (ポート 8000)..." -ForegroundColor Green
    Write-Host "ブラウザで http://localhost:8000 を開きます..." -ForegroundColor Green
    # バックグラウンドでブラウザを起動
    Start-Process "http://localhost:8000"
    # HTTPサーバーを起動
    python -m http.server 8000
} else {
    Write-Host "Pythonが見つからないため、ファイルを直接ブラウザで開きます..." -ForegroundColor Yellow
    Start-Process $HTMLPath
}
