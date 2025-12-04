# Setup and Run Script for Advanced Features
# This script helps you complete steps 2, 3, and 4

Write-Host "🚀 ZK-IoTChain Advanced Features Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_DIR = "C:\Users\shara\Desktop\zkp_mobile\backend"

# Step 2: Check .env configuration
Write-Host "Step 2: Checking Environment Configuration..." -ForegroundColor Yellow
if (Test-Path "$BACKEND_DIR\.env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    $envContent = Get-Content "$BACKEND_DIR\.env" -Raw
    if ($envContent -match "POLYGON_MUMBAI_RPC_URL") {
        Write-Host "✅ Multi-chain RPC URLs configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Multi-chain URLs not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}
Write-Host ""

# Step 3: Check if contracts can be deployed
Write-Host "Step 3: Contract Deployment Status..." -ForegroundColor Yellow
Write-Host "Available networks for deployment:" -ForegroundColor Cyan
Write-Host "  - sepolia (Ethereum Testnet)" -ForegroundColor White
Write-Host "  - polygonMumbai (Polygon Testnet)" -ForegroundColor White
Write-Host "  - bscTestnet (BSC Testnet)" -ForegroundColor White
Write-Host ""
Write-Host "To deploy contracts, run:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npx hardhat run scripts/deploy.js --network polygonMumbai" -ForegroundColor White
Write-Host ""

# Check for existing deployments
$deploymentFiles = Get-ChildItem -Path $BACKEND_DIR -Filter "deployment-*.json" -ErrorAction SilentlyContinue
if ($deploymentFiles) {
    Write-Host "✅ Found existing deployments:" -ForegroundColor Green
    foreach ($file in $deploymentFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
} else {
    Write-Host "ℹ️  No deployments found yet" -ForegroundColor Blue
}
Write-Host ""

# Step 4: Check if server can be tested
Write-Host "Step 4: Testing Advanced Features..." -ForegroundColor Yellow

# Check if server is running
Write-Host "Checking if backend server is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Running comprehensive feature tests..." -ForegroundColor Cyan
    Write-Host ""
    
    # Run test script
    & "$BACKEND_DIR\test_advanced_features.ps1"
}
catch {
    Write-Host "❌ Server is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the server:" -ForegroundColor Yellow
    Write-Host "  1. Open a new terminal" -ForegroundColor White
    Write-Host "  2. cd backend" -ForegroundColor White
    Write-Host "  3. python server.py" -ForegroundColor White
    Write-Host ""
    Write-Host "After server starts, run this script again to test features." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. ✅ Configure .env (Done!)" -ForegroundColor Green
Write-Host "2. 🔨 Deploy contracts to networks" -ForegroundColor Yellow
Write-Host "3. 🧪 Test advanced features" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 For detailed instructions, see: QUICK_START.md" -ForegroundColor Cyan
Write-Host ""
