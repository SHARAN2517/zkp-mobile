import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../utils/api';

interface GasEstimate {
    gas_estimate: number;
    gas_price_gwei: number;
    cost_eth: number;
    success: boolean;
    error?: string;
}

interface GasEstimatorProps {
    operation: 'register_device' | 'authenticate_device' | 'merkle_anchor';
    deviceId?: string;
    deviceType?: string;
    secret?: string;
    merkleRoot?: string;
    batchSize?: number;
    onEstimate?: (estimate: GasEstimate) => void;
}

export default function GasEstimator({
    operation,
    deviceId,
    deviceType,
    secret,
    merkleRoot,
    batchSize,
    onEstimate,
}: GasEstimatorProps) {
    const [estimate, setEstimate] = useState<GasEstimate | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEstimate = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/blockchain/estimate-gas', {
                operation,
                device_id: deviceId,
                device_type: deviceType,
                secret,
                merkle_root: merkleRoot,
                batch_size: batchSize,
            });

            if (response.data.success) {
                setEstimate(response.data);
                onEstimate?.(response.data);
            } else {
                setError(response.data.error || 'Failed to estimate gas');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to estimate gas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (operation && (deviceId || merkleRoot)) {
            fetchEstimate();
        }
    }, [operation, deviceId, deviceType, merkleRoot, batchSize]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#6366f1" />
                <Text style={styles.loadingText}>Estimating gas cost...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchEstimate}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!estimate) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⛽ Gas Estimation</Text>

            <View style={styles.estimateBox}>
                <View style={styles.row}>
                    <Text style={styles.label}>Gas Units</Text>
                    <Text style={styles.value}>{estimate.gas_estimate.toLocaleString()}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Gas Price</Text>
                    <Text style={styles.value}>{estimate.gas_price_gwei.toFixed(2)} Gwei</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.totalLabel}>Estimated Cost</Text>
                    <Text style={styles.totalValue}>{estimate.cost_eth.toFixed(6)} ETH</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={fetchEstimate}>
                <Text style={styles.refreshText}>🔄 Refresh</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginVertical: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    loadingText: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    estimateBox: {
        backgroundColor: '#252541',
        borderRadius: 8,
        padding: 12,
    },
    row: {
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
    divider: {
        height: 1,
        backgroundColor: '#374151',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 16,
        color: '#4ade80',
        fontWeight: '700',
    },
    refreshButton: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 8,
    },
    refreshText: {
        color: '#6366f1',
        fontSize: 14,
        fontWeight: '600',
    },
    errorBox: {
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    errorText: {
        color: '#92400e',
        fontSize: 14,
        marginBottom: 8,
    },
    retryButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
