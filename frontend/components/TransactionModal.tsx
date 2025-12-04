import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Linking } from 'react-native';
import { getEtherscanUrl } from '../utils/web3';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    operation: string;
    gasEstimate?: {
        gas_estimate: number;
        gas_price_gwei: number;
        cost_eth: number;
    };
    deviceInfo?: {
        deviceId?: string;
        deviceType?: string;
    };
    isLoading?: boolean;
    txHash?: string;
    error?: string;
}

export default function TransactionModal({
    visible,
    onClose,
    onConfirm,
    operation,
    gasEstimate,
    deviceInfo,
    isLoading = false,
    txHash,
    error,
}: TransactionModalProps) {
    const getOperationTitle = () => {
        switch (operation) {
            case 'register_device':
                return 'Register Device On-Chain';
            case 'authenticate_device':
                return 'Authenticate Device On-Chain';
            case 'merkle_anchor':
                return 'Anchor Merkle Root';
            default:
                return 'Blockchain Transaction';
        }
    };

    const openEtherscan = () => {
        if (txHash) {
            const url = getEtherscanUrl(txHash);
            Linking.openURL(url);
        }
    };

    // Success state
    if (txHash && !error) {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.successIcon}>
                            <Text style={styles.successIconText}>✓</Text>
                        </View>

                        <Text style={styles.title}>Transaction Submitted!</Text>

                        <Text style={styles.txHash}>
                            {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                        </Text>

                        <TouchableOpacity style={styles.etherscanButton} onPress={openEtherscan}>
                            <Text style={styles.etherscanText}>View on Etherscan →</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // Error state
    if (error) {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.errorIcon}>
                            <Text style={styles.errorIconText}>✕</Text>
                        </View>

                        <Text style={styles.title}>Transaction Failed</Text>

                        <Text style={styles.errorText}>{error}</Text>

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={styles.loadingText}>Waiting for confirmation...</Text>
                        <Text style={styles.hint}>Please confirm the transaction in your wallet</Text>
                    </View>
                </View>
            </Modal>
        );
    }

    // Confirmation state
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>{getOperationTitle()}</Text>

                    {deviceInfo && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Device Information</Text>
                            {deviceInfo.deviceId && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Device ID:</Text>
                                    <Text style={styles.value}>{deviceInfo.deviceId}</Text>
                                </View>
                            )}
                            {deviceInfo.deviceType && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Type:</Text>
                                    <Text style={styles.value}>{deviceInfo.deviceType}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {gasEstimate && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Gas Estimation</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Gas Units:</Text>
                                <Text style={styles.value}>{gasEstimate.gas_estimate.toLocaleString()}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Gas Price:</Text>
                                <Text style={styles.value}>{gasEstimate.gas_price_gwei.toFixed(2)} Gwei</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Estimated Cost:</Text>
                                <Text style={[styles.value, styles.costValue]}>
                                    {gasEstimate.cost_eth.toFixed(6)} ETH
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>Confirm Transaction</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#252541',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#aaa',
    },
    value: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    costValue: {
        color: '#4ade80',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#374151',
    },
    confirmButton: {
        backgroundColor: '#6366f1',
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingText: {
        fontSize: 18,
        color: '#fff',
        marginTop: 16,
        textAlign: 'center',
    },
    hint: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
        textAlign: 'center',
    },
    successIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#4ade80',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    successIconText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '700',
    },
    errorIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    errorIconText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '700',
    },
    txHash: {
        fontSize: 14,
        color: '#888',
        fontFamily: 'monospace',
        textAlign: 'center',
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        color: '#fca5a5',
        textAlign: 'center',
        marginBottom: 20,
    },
    etherscanButton: {
        backgroundColor: '#252541',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    etherscanText: {
        color: '#6366f1',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#374151',
        paddingVertical: 14,
        borderRadius: 8,
    },
    closeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
