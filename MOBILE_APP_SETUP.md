# 📱 ZK-IoTChain Mobile App Setup Guide

## Overview
The ZK-IoTChain mobile app is built with **Expo** (React Native) and provides a complete interface for:
- Device registration with Zero-Knowledge Proofs
- Device authentication
- IoT data submission and anchoring
- Merkle proof verification
- Performance metrics dashboard
- MetaMask wallet integration

---

## Prerequisites

1. **Backend Running**: Ensure backend is running on port 8001
2. **Node.js & Yarn**: Already installed in your environment
3. **Mobile Device or Emulator** (choose one):
   - iOS Simulator (Mac only)
   - Android Emulator
   - Physical iOS/Android device with Expo Go app

---

## Step 1: Install Expo CLI

```bash
npm install -g expo-cli
```

Or use with npx (no global install needed):
```bash
npx expo --version
```

---

## Step 2: Configure Backend URL

### For Local Testing (Expo Web Browser)
Default configuration works:
```bash
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

### For Physical Device Testing
1. Find your computer's local IP:
```bash
# On Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or
hostname -I | awk '{print $1}'
```

2. Update `/app/frontend/.env`:
```bash
EXPO_PUBLIC_BACKEND_URL=http://YOUR_LOCAL_IP:8001
```

Example: `EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8001`

---

## Step 3: Start the Expo Development Server

```bash
cd /app/frontend
npx expo start
```

**You'll see a QR code and options:**
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

---

## Step 4: Choose Your Testing Method

### Option A: Test on Web Browser (Quick Testing)
```
Press 'w' in the terminal
```
Opens in your browser at `http://localhost:8081`

**Pros**: Quick, no device needed
**Cons**: Some features like WalletConnect may not work fully

### Option B: Test on iOS Simulator (Mac only)
```
Press 'i' in the terminal
```

**Prerequisites**:
- Xcode installed
- iOS Simulator configured

### Option C: Test on Android Emulator
```
Press 'a' in the terminal
```

**Prerequisites**:
- Android Studio installed
- Android Emulator running

### Option D: Test on Physical Device (Recommended for Full Experience)

#### iOS Device:
1. Install **Expo Go** from App Store
2. Open Camera app
3. Scan the QR code from terminal
4. App opens in Expo Go

#### Android Device:
1. Install **Expo Go** from Play Store
2. Open Expo Go app
3. Scan the QR code from terminal
4. App loads automatically

---

## Step 5: Verify Backend Connection

Once app is running:
1. You should see the landing screen with "ZK-IoTChain" title
2. Tap "Get Started" button
3. Go to Home tab - you should see metrics loading
4. If metrics load successfully, backend connection is working!

**If you see connection errors**:
- Verify backend is running: `sudo supervisorctl status backend`
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Verify BACKEND_URL in .env matches your setup

---

## Step 6: Test Core Features

### 6.1 View System Metrics (Home Tab)
- Check device statistics
- View data management stats
- See blockchain metrics (if deployed)

### 6.2 Register a Test Device (Devices Tab)
```
Device ID: iot-device-test-001
Device Name: Smart Sensor
Device Type: smart-city
Secret: my-secure-password-123
```

Tap "Register Device" → Should see success with ZKP proof

### 6.3 Authenticate Device
Use the same device_id and secret from registration
→ Should authenticate successfully with timestamp

### 6.4 Submit IoT Data
```json
{
  "temperature": 23.5,
  "humidity": 65,
  "location": "Building A"
}
```

### 6.5 Anchor Data (Verify Tab)
- Navigate to Verify tab
- Tap "Anchor Pending Data"
- If blockchain is deployed, creates Merkle root on-chain

### 6.6 Verify Data Integrity
- Enter a data hash from submitted data
- Enter the batch ID
- Tap "Verify" → Shows proof and validation result

---

## App Structure

```
/app/frontend/
├── app/
│   ├── index.tsx              # Landing screen
│   ├── _layout.tsx            # Root layout
│   └── (tabs)/                # Tab navigation
│       ├── _layout.tsx        # Tab navigator
│       ├── home.tsx           # Dashboard with metrics
│       ├── devices.tsx        # Device management
│       ├── verify.tsx         # Data verification
│       └── profile.tsx        # Settings & info
├── utils/
│   └── api.ts                 # Backend API client
├── stores/
│   └── appStore.ts            # Global state (Zustand)
└── assets/                    # Images & fonts
```

---

## WalletConnect Integration (Optional)

For blockchain transaction signing:

1. Install MetaMask on your mobile device
2. Tap "Connect Wallet" in the app
3. Select MetaMask from WalletConnect modal
4. Approve connection
5. Now you can sign blockchain transactions from the app!

**Note**: WalletConnect requires deployed smart contracts on Sepolia

---

## Development Tips

### Hot Reload
- Changes to TypeScript/JSX files reload automatically
- If stuck, press 'r' in terminal to manually reload

### Clear Cache
```bash
cd /app/frontend
npx expo start --clear
```

### View Console Logs
```bash
# Terminal shows console.log from app
# Or open React DevTools in browser (web mode)
```

### Debug API Calls
Add logging in `/app/frontend/utils/api.ts`:
```typescript
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method, config.url);
  return config;
});
```

---

## Building for Production

### Build APK (Android)
```bash
cd /app/frontend
npx eas build --platform android --profile preview
```

### Build IPA (iOS)
```bash
cd /app/frontend
npx eas build --platform ios --profile preview
```

**Note**: Requires Expo EAS account (free tier available)

---

## Troubleshooting

### "Unable to resolve module"
```bash
cd /app/frontend
rm -rf node_modules
yarn install
npx expo start --clear
```

### "Network request failed"
- Check EXPO_PUBLIC_BACKEND_URL in .env
- Ensure backend is accessible from your device
- Verify firewall isn't blocking port 8001

### "Expo Go crashed"
- Usually due to incompatible native modules
- Try web version first to debug
- Check Expo Go version matches Expo SDK version

### Backend not responding
```bash
# Check backend status
sudo supervisorctl status backend

# Restart backend
sudo supervisorctl restart backend

# View logs
tail -f /var/log/supervisor/backend.err.log
```

### Port 8081 already in use
```bash
# Kill existing Metro bundler
lsof -ti:8081 | xargs kill -9

# Restart
npx expo start
```

---

## Mobile App Features Checklist

✅ **Implemented & Working**:
- [x] Landing screen with features
- [x] Tab navigation (Home, Devices, Verify, Profile)
- [x] System metrics dashboard
- [x] Device registration with ZKP
- [x] Device authentication
- [x] Device list view
- [x] IoT data submission
- [x] Merkle root anchoring
- [x] Data integrity verification
- [x] Real-time metrics refresh
- [x] Error handling & loading states
- [x] Dark theme UI
- [x] Pull-to-refresh

⚠️ **Requires Blockchain Deployment**:
- [ ] On-chain device registration
- [ ] On-chain authentication
- [ ] MetaMask wallet connection
- [ ] Transaction signing
- [ ] Gas estimation

📱 **Mobile-Specific Features**:
- Responsive design for all screen sizes
- Native navigation gestures
- Pull-to-refresh on all data screens
- Haptic feedback (on supported devices)
- Status bar theming

---

## Performance

- **App Size**: ~50-60 MB (with dependencies)
- **Initial Load**: 2-3 seconds
- **API Response**: <500ms (local backend)
- **Hot Reload**: <1 second

---

## Next Steps

1. **Test Core Flows**: Registration → Authentication → Data submission → Verification
2. **Deploy Smart Contracts**: See `/app/BLOCKCHAIN_SETUP.md`
3. **Connect MetaMask**: Enable wallet features
4. **Customize UI**: Update colors, logos in `app.json` and styles
5. **Add Analytics**: Integrate Segment, Mixpanel, etc.
6. **Push Notifications**: For device alerts (Expo Notifications)

---

## Support

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **WalletConnect**: https://walletconnect.com/
- **Backend API Docs**: Check backend server logs for endpoint details

Happy coding! 🚀
