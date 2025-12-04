import { create } from 'zustand';

interface Transaction {
    hash: string;
    type: 'register_device' | 'authenticate_device' | 'merkle_anchor';
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    gasUsed?: number;
    deviceId?: string;
}

interface WalletState {
    // Connection state
    address: string | null;
    balance: string;
    chainId: number | null;
    isConnected: boolean;
    isConnecting: boolean;

    // Network info
    gasPrice: string;
    blockNumber: number;

    // Transaction history
    transactions: Transaction[];

    // Actions
    setWalletInfo: (address: string, chainId: number) => void;
    setBalance: (balance: string) => void;
    setGasPrice: (gasPrice: string) => void;
    setBlockNumber: (blockNumber: number) => void;
    addTransaction: (tx: Transaction) => void;
    updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
    disconnect: () => void;
    reset: () => void;
}

const initialState = {
    address: null,
    balance: '0',
    chainId: null,
    isConnected: false,
    isConnecting: false,
    gasPrice: '0',
    blockNumber: 0,
    transactions: [],
};

export const useWalletStore = create<WalletState>((set) => ({
    ...initialState,

    setWalletInfo: (address, chainId) =>
        set({
            address,
            chainId,
            isConnected: true,
            isConnecting: false
        }),

    setBalance: (balance) =>
        set({ balance }),

    setGasPrice: (gasPrice) =>
        set({ gasPrice }),

    setBlockNumber: (blockNumber) =>
        set({ blockNumber }),

    addTransaction: (tx) =>
        set((state) => ({
            transactions: [tx, ...state.transactions].slice(0, 50) // Keep last 50
        })),

    updateTransaction: (hash, updates) =>
        set((state) => ({
            transactions: state.transactions.map(tx =>
                tx.hash === hash ? { ...tx, ...updates } : tx
            )
        })),

    disconnect: () =>
        set({
            address: null,
            chainId: null,
            isConnected: false,
            balance: '0'
        }),

    reset: () =>
        set(initialState),
}));
