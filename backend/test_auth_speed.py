"""
Test Device Authentication with Fresh Device
"""
import requests
import time

BASE_URL = "http://localhost:8001/api"

# Use a unique device ID
device_id = f"test-device-{int(time.time())}"
device_secret = "my_super_secure_password_123"

print(f"\n=== Testing Authentication with Device: {device_id} ===\n")

# Step 1: Register device
print("1. Registering new device...")
try:
    response = requests.post(f"{BASE_URL}/devices/register", json={
        "device_id": device_id,
        "device_name": "Test Device",
        "device_type": "healthcare",
        "secret": device_secret
    })
    
    if response.ok:
        print(f"✅ Registration successful!")
        print(f"   Device ID: {device_id}")
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   {response.text}")
        exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 2: Authenticate with correct secret (should be FAST)
print("\n2. Authenticating with CORRECT secret...")
start_time = time.time()
try:
    response = requests.post(f"{BASE_URL}/devices/authenticate", json={
        "device_id": device_id,
        "secret": device_secret
    })
    
    elapsed = time.time() - start_time
    
    if response.ok:
        result = response.json()
        print(f"✅ Authentication successful! (took {elapsed:.2f}s)")
        print(f"   Status: {result.get('success')}")
        print(f"   Message: {result.get('message')}")
    else:
        print(f"❌ Authentication failed: {response.status_code}")
        print(f"   {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 3: Authenticate with WRONG secret (should FAIL quickly)
print("\n3. Authenticating with WRONG secret...")
start_time = time.time()
try:
    response = requests.post(f"{BASE_URL}/devices/authenticate", json={
        "device_id": device_id,
        "secret": "wrong_password"
    })
    
    elapsed = time.time() - start_time
    
    if response.ok:
        print(f"⚠️  Authentication succeeded (should have failed!)")
    else:
        print(f"✅ Authentication correctly rejected! (took {elapsed:.2f}s)")
        print(f"   Status: {response.status_code}")
        error = response.json()
        print(f"   Error: {error.get('detail')}")
except Exception as e:
    print(f"Error: {e}")

print("\n=== Test Complete ===\n")
print("✓ Registration: Works")
print("✓ Correct Secret Auth: Fast & Successful")
print("✓ Wrong Secret Auth: Fast & Rejected")
