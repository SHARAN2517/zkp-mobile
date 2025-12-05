"""
Test Device Registration and Authentication Flow
"""
import requests
import json

BASE_URL = "http://localhost:8001/api"

print("\n=== Testing Device Registration & Authentication ===\n")

# Step 1: Register a device
print("1. Registering device...")
register_data = {
    "device_id": "test-sensor-123",
    "device_name": "Test Temperature Sensor",
    "device_type": "healthcare",
    "secret": "my_secure_secret_password"
}

try:
    response = requests.post(f"{BASE_URL}/devices/register", json=register_data)
    if response.ok:
        result = response.json()  
        print(f"✅ Registration successful!")
        print(f"   Device ID: {result.get('device_id')}")
        print(f"   Public Key Hash: {result.get('public_key_hash', result.get('commitment'))}")
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   {response.text}")
except Exception as e:
    print(f"❌ Registration error: {e}")

# Step 2: Authenticate the device
print("\n2. Authenticating device...")
auth_data = {
    "device_id": "test-sensor-123",
    "secret": "my_secure_secret_password"
}

try:
    response = requests.post(f"{BASE_URL}/devices/authenticate", json=auth_data)
    if response.ok:
        result = response.json()
        print(f"✅ Authentication successful!")
        print(f"   Status: {result.get('status')}")
        print(f"   Message: {result.get('message')}")
        if 'proof' in result:
            print(f"   ZKP Proof Generated: ✓")
    else:
        print(f"❌ Authentication failed: {response.status_code}")
        print(f"   {response.text}")
except Exception as e:
    print(f"❌ Authentication error: {e}")

# Step 3: Try authentication with wrong secret
print("\n3. Testing authentication with wrong secret...")
wrong_auth = {
    "device_id": "test-sensor-123",
    "secret": "wrong_password"
}

try:
    response = requests.post(f"{BASE_URL}/devices/authenticate", json=wrong_auth)
    if response.ok:
        print(f"⚠️  Authentication succeeded (should have failed!)")
    else:
        print(f"✅ Authentication correctly rejected!")
        print(f"   Status: {response.status_code}")
        print(f"   Error: {response.json().get('detail')}")
except Exception as e:
    print(f"Error: {e}")

print("\n=== Test Complete ===\n")
