import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingSkeletonProps {
    height?: number;
    width?: string | number;
    borderRadius?: number;
    marginBottom?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    height = 40,
    width = '100%',
    borderRadius = 8,
    marginBottom = 12,
}) => {
    return (
        <View
            style={[
                styles.skeleton,
                {
                    height,
                    width,
                    borderRadius,
                    marginBottom,
                },
            ]}
        >
            <View style={styles.shimmer} />
        </View>
    );
};

export const DeviceCardSkeleton = () => {
    return (
        <View style={styles.card}>
            <LoadingSkeleton height={24} width="60%" marginBottom={8} />
            <LoadingSkeleton height={16} width="40%" marginBottom={8} />
            <LoadingSkeleton height={16} width="80%" />
        </View>
    );
};

export const MetricSkeleton = () => {
    return (
        <View style={styles.metricCard}>
            <LoadingSkeleton height={20} width="50%" marginBottom={8} />
            <LoadingSkeleton height={32} width="70%" />
        </View>
    );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <DeviceCardSkeleton key={index} />
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#252541',
        overflow: 'hidden',
    },
    shimmer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    metricCard: {
        backgroundColor: '#252541',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
});

export default LoadingSkeleton;
