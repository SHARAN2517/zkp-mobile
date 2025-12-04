import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';
import { useWalletStore } from '../stores/walletStore';
import { truncateAddress, formatEth, getNetworkName, isCorrectNetwork } from '../utils/web3';

export default function WalletConnect() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const { data: balanceData } = useBalance({ address });

    const setWalletInfo = useWalletStore(state => state.setWalletInfo);
    const setBalance = useWalletStore(state => state.setBalance);
    const disconnectStore = useWalletStore(state => state.disconnect);

    // Update store when wallet changes
    React.useEffect(() => {
        if (isConnected && address && chainId) {
            setWalletInfo(address, chainId);
        }
    }, [isConnected, address, chainId]);

    React.useEffect(() => {
        if (balanceData) {
            setBalance(balanceData.value.toString());
        }
    }, [balanceData]);

    const handleConnect = () => {
        const walletConnectConnector = connectors.find(c => c.name === 'WalletConnect');
        if (walletConnectConnector) {
            connect({ connector: walletConnectConnector });
        }
    };

    const handleDisconnect = () => {
        disconnect();
        disconnectStore();
    };

    const correctNetwork = chainId ? isCorrectNetwork(chainId) : false;

    if (isConnected && address) {
        return (
            <View style={styles.container}>
                <View style={styles.connectedContainer}>
                    <View style={styles.infoSection}>
                        <Text style={styles.label}>Wallet</Text>
                        <Text style={styles.address}>{truncateAddress(address)}</Text>

                        {balanceData && (
                            <>
                                <Text style={styles.label}>Balance</Text>
                                <Text style={styles.balance}>{formatEth(balanceData.value)} ETH</Text>
                            </>
                        )}

                        {chainId && (
                            <>
                                <Text style={styles.label}>Network</Text>
                                <View style={styles.networkContainer}>
                                    <View style={[styles.networkDot, correctNetwork ? styles.greenDot : styles.redDot]} />
                                    <Text style={[styles.network, !correctNetwork && styles.wrongNetwork]}>
                                        {getNetworkName(chainId)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.disconnectButton}
                        onPress={handleDisconnect}
                    >
                        <Text style={styles.disconnectText}>Disconnect</Text>
                    </TouchableOpacity>
                </View>

                {!correctNetwork && (
                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            ⚠️ Please switch to Sepolia Testnet
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.connectButton, isPending && styles.connectButtonDisabled]}
                onPress={handleConnect}
                disabled={isPending}
            >
                {isPending ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.connectText}>Connect Wallet</Text>
                )}
            </TouchableOpacity>
            <Text style={styles.hint}>Connect with MetaMask or WalletConnect</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    connectedContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoSection: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
        marginBottom: 4,
    },
    address: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    balance: {
        fontSize: 18,
        color: '#4ade80',
        fontWeight: '700',
    },
    networkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    network: {
        fontSize: 14,
        color: '#fff',
        marginLeft: 8,
    },
    wrongNetwork: {
        color: '#ef4444',
    },
    networkDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    greenDot: {
        backgroundColor: '#4ade80',
    },
    redDot: {
        backgroundColor: '#ef4444',
    },
    disconnectButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    disconnectText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    connectButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    connectButtonDisabled: {
        opacity: 0.6,
    },
    connectText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    hint: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
    },
    warningBox: {
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    warningText: {
        color: '#92400e',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
