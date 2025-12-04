import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi-react-native';
import { mainnet, sepolia } from 'viem/chains';
import { WagmiConfig } from 'wagmi';

// Get WalletConnect project ID from env
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Define chains
const chains = [sepolia, mainnet] as const;

// Wagmi configuration
const metadata = {
    name: 'ZK-IoTChain',
    description: 'Zero-Knowledge Proof IoT Authentication',
    url: 'https://zkiotchain.app',
    icons: ['https://zkiotchain.app/icon.png'],
};

export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
});

// Create modal
export const web3Modal = createWeb3Modal({
    projectId,
    chains,
    wagmiConfig: config,
    enableAnalytics: false,
});

/**
 * Format wallet address for display (0x1234...5678)
 */
export function truncateAddress(address: string, chars = 4): string {
    if (!address) return '';
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format ETH balance for display
 */
export function formatEth(balance: bigint | string, decimals = 4): string {
    const value = typeof balance === 'string' ? BigInt(balance) : balance;
    const eth = Number(value) / 1e18;
    return eth.toFixed(decimals);
}

/**
 * Parse blockchain error messages for user-friendly display
 */
export function parseBlockchainError(error: any): string {
    const message = error?.message || error?.toString() || 'Unknown error';

    if (message.includes('user rejected')) {
        return 'Transaction cancelled by user';
    }

    if (message.includes('insufficient funds')) {
        return 'Insufficient ETH balance for gas fees';
    }

    if (message.includes('gas required exceeds allowance')) {
        return 'Gas limit too low. Try increasing gas limit.';
    }

    if (message.includes('nonce too low')) {
        return 'Transaction nonce error. Please try again.';
    }

    if (message.includes('already registered')) {
        return 'Device already registered on blockchain';
    }

    // Return first line of error message
    return message.split('\n')[0].substring(0, 100);
}

/**
 * Get Etherscan URL for transaction
 */
export function getEtherscanUrl(txHash: string, chainId: number = 11155111): string {
    const baseUrl = chainId === 1
        ? 'https://etherscan.io'
        : 'https://sepolia.etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get Etherscan URL for address
 */
export function getEtherscanAddressUrl(address: string, chainId: number = 11155111): string {
    const baseUrl = chainId === 1
        ? 'https://etherscan.io'
        : 'https://sepolia.etherscan.io';
    return `${baseUrl}/address/${address}`;
}

/**
 * Check if on correct network (Sepolia)
 */
export function isCorrectNetwork(chainId: number): boolean {
    const expectedChainId = Number(process.env.EXPO_PUBLIC_CHAIN_ID) || 11155111; // Sepolia
    return chainId === expectedChainId;
}

/**
 * Get network name
 */
export function getNetworkName(chainId: number): string {
    switch (chainId) {
        case 1:
            return 'Ethereum Mainnet';
        case 11155111:
            return 'Sepolia Testnet';
        case 5:
            return 'Goerli Testnet';
        default:
            return `Chain ID ${chainId}`;
    }
}
