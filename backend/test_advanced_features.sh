#!/bin/bash

# ZK-IoTChain Advanced Features Test Suite
# This script tests all 6 advanced features

echo "🧪 Testing ZK-IoTChain Advanced Features"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8001/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "${BLUE}Testing: $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        echo "$body" | python -m json.tool 2>/dev/null || echo "$body"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "$body"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo "=== 1. Multi-Blockchain Support ==="
echo ""
test_endpoint "List Networks" "GET" "/multichain/networks"
test_endpoint "Get Sepolia Network" "GET" "/multichain/network/sepolia"
test_endpoint "Switch to Polygon Mumbai" "POST" "/multichain/switch-network" '{"network":"polygonMumbai"}'

echo "=== 2. Enhanced ZKP Schemes ==="
echo ""
test_endpoint "List ZKP Schemes" "GET" "/zkp/schemes"

echo "=== 3. Real-Time Monitoring ==="
echo ""
test_endpoint "Device Heartbeat" "POST" "/realtime/device/test-sensor-001/heartbeat"
test_endpoint "Get Device Statuses" "GET" "/realtime/devices/status"
test_endpoint "Get Event History" "GET" "/realtime/events?limit=10"

echo "=== 4. Advanced Analytics ==="
echo ""
test_endpoint "Analytics Overview" "GET" "/analytics/overview"
test_endpoint "Proof Analytics" "GET" "/analytics/proofs"
test_endpoint "Blockchain Analytics" "GET" "/analytics/blockchain"

echo "=== 5. Multi-Signature Registration ==="
echo ""
test_endpoint "List Multi-Sig Proposals" "GET" "/multisig/proposals"
test_endpoint "List Authorized Signers" "GET" "/multisig/signers"

# Create a proposal
PROPOSAL_DATA='{
  "device_id": "test-device-multisig-001",
  "device_name": "Test Multi-Sig Device",
  "device_type": "industrial",
  "secret": "test_secret_key_123",
  "required_approvals": 2
}'
test_endpoint "Create Multi-Sig Proposal" "POST" "/multisig/propose-registration" "$PROPOSAL_DATA"

echo "=== 6. Cross-Chain Data Anchoring ==="
echo ""
test_endpoint "Get Cross-Chain Sync Status" "GET" "/cross-chain/sync-status"
test_endpoint "List Cross-Chain Anchors" "GET" "/cross-chain/anchors"

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi
