import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
    actionText,
    onAction,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {actionText && onAction && (
                <TouchableOpacity style={styles.actionButton} onPress={onAction}>
                    <Text style={styles.actionText}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export const NoDevicesEmpty = ({ onRegister }: { onRegister?: () => void }) => (
    <EmptyState
        icon="📱"
        title="No Devices Yet"
        description="Register your first IoT device to get started with secure ZKP authentication"
        actionText="Register Device"
        onAction={onRegister}
    />
);

export const NoPendingDataEmpty = () => (
    <EmptyState
        icon="✅"
        title="No Pending Data"
        description="All your IoT data has been anchored to the blockchain"
    />
);

export const NoBatchesEmpty = () => (
    <EmptyState
        icon="📦"
        title="No Batches Created"
        description="Merkle tree batches will appear here once data is anchored"
    />
);

export const NoTransactionsEmpty = () => (
    <EmptyState
        icon="🔗"
        title="No Transactions"
        description="Your blockchain transactions will appear here"
    />
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    actionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EmptyState;
