#!/usr/bin/env pwsh
# Deploy to Firebase Hosting

$ErrorActionPreference = "Stop"
$WarningPreference = "SilentlyContinue"

Write-Host "=== Firebase Hosting Deployment ===" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Firebase authentication..." -ForegroundColor Cyan
$authCheck = firebase projects:list 2>&1
if ($authCheck -like "*Failed to authenticate*" -or $LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated. Opening login..." -ForegroundColor Red
    Write-Host ""
    
    # Try to open browser for authentication
    $authUrl = "https://auth.firebase.tools/login"
    Write-Host "Opening Firebase authentication in browser..."
    Start-Process $authUrl
    
    Write-Host ""
    Write-Host "1. Authorize the Firebase CLI in the browser"
    Write-Host "2. Copy the authorization code from the browser"
    Write-Host "3. Return here and the deployment will continue"
    Write-Host ""
    
    # Wait for user interaction
    Read-Host "Press Enter after authorization is complete"
    Write-Host ""
}

# Select project
Write-Host "Selecting Firebase project..." -ForegroundColor Cyan
firebase use realtime-trading-d084e
Write-Host ""

# Build
Write-Host "Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed" -ForegroundColor Green
Write-Host ""

# Deploy
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 View your site: https://realtimetradingsignals.com" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}
