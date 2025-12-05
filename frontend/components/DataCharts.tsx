// Simplified Data Charts - No external dependencies
// Shows placeholder cards for future chart integration

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import minimalistTheme from '../utils/minimalistTheme';

const theme = minimalistTheme;

export const DeviceActivityChart: React.FC = () => {
    return (
        <View style={styles.chartPlaceholder}>
            <Text style={styles.chartTitle}>📊 Device Activity Chart</Text>
            <Text style={styles.chartSubtitle}>7-day activity visualization</Text>
            <View style={styles.chartBar}>
                <View style={[styles.bar, { height: 60 }]} />
                <View style={[styles.bar, { height: 80 }]} />
                <View style={[styles.bar, { height: 70 }]} />
                <View style={[styles.bar, { height: 90 }]} />
                <View style={[styles.bar, { height: 75 }]} />
                <View style={[styles.bar, { height: 100 }]} />
                <View style={[styles.bar, { height: 95 }]} />
            </View>
            <Text style={styles.installNote}>Install react-native-chart-kit for full charts</Text>
        </View>
    );
};

export const DataSubmissionChart: React.FC = () => {
    return (
        <View style={styles.chartPlaceholder}>
            <Text style={styles.chartTitle}>📈 Data Submissions</Text>
            <Text style={styles.chartSubtitle}>Weekly submission trends</Text>
            <View style={styles.chartBar}>
                <View style={[styles.bar, { height: 50 }]} />
                <View style={[styles.bar, { height: 65 }]} />
                <View style={[styles.bar, { height: 55 }]} />
                <View style={[styles.bar, { height: 75 }]} />
                <View style={[styles.bar, { height: 70 }]} />
                <View style={[styles.bar, { height: 85 }]} />
                <View style={[styles.bar, { height: 80 }]} />
            </View>
            <Text style={styles.installNote}>Placeholder - full charts coming soon</Text>
        </View>
    );
};

export const DeviceTypeDistribution: React.FC = () => {
    return (
        <View style={styles.chartPlaceholder}>
            <Text style={styles.chartTitle}>🥧 Device Distribution</Text>
            <Text style={styles.chartSubtitle}>Device types breakdown</Text>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.primary.main }]} />
                    <Text style={styles.legendText}>Temperature (15)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.primary.light }]} />
                    <Text style={styles.legendText}>Humidity (10)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.primary.dark }]} />
                    <Text style={styles.legendText}>Motion (8)</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartPlaceholder: {
        ...theme.glassmorphism.dark as any,
        padding: theme.spacing[5],
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing[4],
    },
    chartTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold as any,
        color: theme.colors.white,
        marginBottom: theme.spacing[2],
    },
    chartSubtitle: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.gray[400],
        marginBottom: theme.spacing[4],
    },
    chartBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
        gap: theme.spacing[2],
        marginBottom: theme.spacing[3],
    },
    bar: {
        flex: 1,
        backgroundColor: theme.colors.primary.main,
        borderRadius: theme.borderRadius.sm,
        opacity: 0.8,
    },
    legend: {
        gap: theme.spacing[2],
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.gray[300],
    },
    installNote: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.gray[500],
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default {
    DeviceActivityChart,
    DataSubmissionChart,
    DeviceTypeDistribution,
};
