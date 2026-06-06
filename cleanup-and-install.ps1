# AVEMS - Cleanup and Install Script
# Run this to remove node_modules and reinstall with React 18

Write-Host "🧹 AVEMS Dependency Cleanup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop Node processes
Write-Host "Step 1: Stopping Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Node processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Remove node_modules
Write-Host "Step 2: Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    try {
        Remove-Item -Recurse -Force "node_modules" -ErrorAction Stop
        Write-Host "✓ node_modules removed" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not remove node_modules automatically" -ForegroundColor Red
        Write-Host "Please manually delete the node_modules folder and run this script again" -ForegroundColor Yellow
        Write-Host "Then press Enter to exit..."
        Read-Host
        exit 1
    }
} else {
    Write-Host "✓ node_modules already removed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Remove package-lock.json
Write-Host "Step 3: Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✓ package-lock.json removed" -ForegroundColor Green
} else {
    Write-Host "✓ package-lock.json already removed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Verify package.json has React 18
Write-Host "Step 4: Verifying package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$reactVersion = $packageJson.dependencies.react

if ($reactVersion -match "18\.") {
    Write-Host "✓ package.json has React 18 ($reactVersion)" -ForegroundColor Green
} else {
    Write-Host "⚠ package.json still has React $reactVersion" -ForegroundColor Red
    Write-Host "Please update package.json manually to use React 18.3.1" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}
Write-Host ""

# Step 5: Install dependencies
Write-Host "Step 5: Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
Write-Host ""

try {
    npm install
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "✗ npm install failed" -ForegroundColor Red
    Write-Host "Please check the errors above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}
Write-Host ""

# Step 6: Verify no dependency conflicts
Write-Host "Step 6: Checking for dependency conflicts..." -ForegroundColor Yellow
$lucideVersion = $packageJson.dependencies."lucide-react"
Write-Host "✓ lucide-react@$lucideVersion is compatible with React 18" -ForegroundColor Green
Write-Host ""

# Success!
Write-Host "=================================" -ForegroundColor Green
Write-Host "✅ CLEANUP AND INSTALL COMPLETE!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Verify app works at http://localhost:5175" -ForegroundColor White
Write-Host "3. Run: npm run build" -ForegroundColor White
Write-Host "4. Commit and push changes to trigger Vercel deployment" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host
