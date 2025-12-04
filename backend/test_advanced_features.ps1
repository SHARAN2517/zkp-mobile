# ZK-IoTChain Advanced Features Test Suite (PowerShell)
# This script tests all 6 advanced features

Write-Host "🧪 Testing ZK-IoTChain Advanced Features" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:8001/api"

# Test counter
$TESTS_PASSED = 0
$TESTS_FAILED = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Blue
    
    try {
        $uri = "$BASE_URL$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $Data -ContentType "application/json" -ErrorAction Stop
        }
        
        Write-Host "✓ PASSED" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 4
        $script:TESTS_PASSED++
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        $script:TESTS_FAILED++
    }
    Write-Host ""
}

Write-Host "=== 1. Multi-Blockchain Support ===" -ForegroundColor Yellow
Write-Host ""
Test-Endpoint -Name "List Networks" -Method "GET" -Endpoint "/multichain/networks"
Test-Endpoint -Name "Get Sepolia Network" -Method "GET" -Endpoint "/multichain/network/sepolia"
Test-Endpoint -Name "Switch to Polygon Mumbai" -Method "POST" -Endpoint "/multichain/switch-network" -Data '{"network":"polygonMumbai"}'

Write-Host "=== 2. Enhanced ZKP Schemes ===" -ForegroundColor Yellow
Write-Host ""
Test-Endpoint -Name "List ZKP Schemes" -Method "GET" -Endpoint "/zkp/schemes"

Write-Host "=== 3. Real-Time Monitoring ===" -ForegroundColor Yellow
Write-Host ""
Test-Endpoint -Name "Device Heartbeat" -Method "POST" -Endpoint "/realtime/device/test-sensor-001/heartbeat"
Test-Endpoint -Name "Get Device Statuses" -Method "GET" -Endpoint "/realtime/devices/status"
Test-Endpoint -Name "Get Event History" -Method "GET" -Endpoint "/realtime/events?limit=10"

Write-Host "=== 4. Advanced Analytics ===" -ForegroundColor Yellow
Write-Host ""
Test-Endpoint -Name "Analytics Overview" -Method "GET" -Endpoint "/analytics/overview"
Test-Endpoint -Name "Proof Analytics" -Method "GET" -Endpoint "/analytics/proofs"
Test-Endpoint -Name "Blockchain Analytics" -Method "GET" -Endpoint "/analytics/blockchain"

Write-Host "=== 5. Multi-Signature Registration ===" -ForegroundColor Yellow
Write-Host ""
Test-Endpoint -Name "List Multi-Sig Proposals" -Method "GET" -Endpoint "/multisig/proposals"
Test-Endpoint -Name "List Authorized Signers" -Method "GET" -Endpoint "/multisig/signers"

# Create a proposal
$PROPOSAL_DATA = @{
    device_id = "test-device-multisig-001"
    device_name = "Test Multi-Sig Device"
    device_type = "industrial"
    secret = "test_secret_key_123"
    required_approvals = 2
} | ConvertTo-Json

Test-Endpoint -Name "Create Multi-Sig Proposal" -Method "POST" -Endpoint "/multisig/propose-registration" -Data $PROPOSAL_DATA

Write-Host "=== 6. Cross-Chain Data Anchoring ===" -ForegroundColor Yellow
Write-Host ""
Test-Endpoint -Name "Get Cross-Chain Sync Status" -Method "GET" -Endpoint "/cross-chain/sync-status"
Test-Endpoint -Name "List Cross-Chain Anchors" -Method "GET" -Endpoint "/cross-chain/anchors"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $TESTS_PASSED" -ForegroundColor Green
Write-Host "Tests Failed: $TESTS_FAILED" -ForegroundColor Red
Write-Host ""

if ($TESTS_FAILED -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Check the output above." -ForegroundColor Red
    exit 1
}
