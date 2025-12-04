import { create } from 'zustand';

interface AppState {
  walletAddress: string | null;
  isConnected: boolean;
  selectedDevice: string | null;
  setWalletAddress: (address: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setSelectedDevice: (deviceId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  walletAddress: null,
  isConnected: false,
  selectedDevice: null,
  setWalletAddress: (address) => set({ walletAddress: address }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setSelectedDevice: (deviceId) => set({ selectedDevice: deviceId }),
}));
