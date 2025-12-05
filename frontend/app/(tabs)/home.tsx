import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSystemMetrics, type Metrics } from '../../utils/api';
import minimalistTheme from '../../utils/minimalistTheme';
import {
  DeviceActivityChart,
  DataSubmissionChart,
  DeviceTypeDistribution,
} from '../../components/DataCharts';
import { BlockchainNodeIcon, GatewayIcon } from '../../components/IoTIcons';

const theme = minimalistTheme;

export default function HomeScreen() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = async () => {
    try {
      const data = await getSystemMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary.main}
        />
      }
    >
      <View style={styles.content}>
        {/* Header with Glassmorphism */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Dashboard</Text>
            <Text style={styles.title}>ZK-IoTChain</Text>
          </View>
          <View style={styles.iconContainer}>
            <BlockchainNodeIcon size={40} color={theme.colors.primary.main} />
          </View>
        </View>


        {/* Devices Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#1a3a1a' }]}>
              <Ionicons name="hardware-chip" size={32} color="#00ff88" />
              <Text style={styles.statValue}>{metrics?.devices.total || 0}</Text>
              <Text style={styles.statLabel}>Total Devices</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#1a2a3a' }]}>
              <Ionicons name="checkmark-circle" size={32} color="#00d4ff" />
              <Text style={styles.statValue}>{metrics?.devices.active || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Data Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Total Data Submitted</Text>
              <Text style={styles.dataValue}>{metrics?.data.total_submitted || 0}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Anchored On-Chain</Text>
              <Text style={styles.dataValue}>{metrics?.data.anchored || 0}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Pending</Text>
              <Text style={[styles.dataValue, { color: '#ffaa00' }]}>
                {metrics?.data.pending || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Blockchain Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blockchain Metrics</Text>
          <View style={styles.blockchainCard}>
            <View style={styles.blockchainRow}>
              <Ionicons name="layers" size={24} color="#00d4ff" />
              <View style={styles.blockchainInfo}>
                <Text style={styles.blockchainLabel}>Merkle Batches</Text>
                <Text style={styles.blockchainValue}>{metrics?.merkle_batches || 0}</Text>
              </View>
            </View>
            <View style={styles.blockchainRow}>
              <Ionicons name="flash" size={24} color="#ffaa00" />
              <View style={styles.blockchainInfo}>
                <Text style={styles.blockchainLabel}>Avg Gas Per Batch</Text>
                <Text style={styles.blockchainValue}>
                  {metrics?.blockchain.average_gas_per_batch.toFixed(0) || 0}
                </Text>
              </View>
            </View>
            <View style={styles.blockchainRow}>
              <Ionicons name="wallet" size={24} color="#00ff88" />
              <View style={styles.blockchainInfo}>
                <Text style={styles.blockchainLabel}>Account Balance</Text>
                <Text style={styles.blockchainValue}>
                  {metrics?.blockchain.account_balance.toFixed(4) || 0} ETH
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Data Visualization Charts */}
        <View style={styles.section}>
          <DeviceActivityChart />
        </View>

        <View style={styles.section}>
          <DataSubmissionChart />
        </View>

        {/* Authentication Stats */}
        <View style={styles.section}>
          <View style={styles.authCard}>
            <BlockchainNodeIcon size={48} color={theme.colors.primary.main} />
            <Text style={styles.authValue}>{metrics?.authentications || 0}</Text>
            <Text style={styles.authLabel}>Total ZKP Authentications</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[900],
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.gray[400],
    marginTop: theme.spacing[4],
    fontSize: theme.typography.sizes.md,
  },
  content: {
    padding: theme.spacing[4],
  },
  header: {
    ...theme.glassmorphism.dark as any,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[5],
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing[6],
  },
  headerContent: {
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.glass.whiteStrong,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing[1],
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold as any,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  dataCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dataLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  dataValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  blockchainCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 16,
  },
  blockchainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blockchainInfo: {
    flex: 1,
  },
  blockchainLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  blockchainValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  authCard: {
    backgroundColor: '#1a1a2a',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  authValue: {
    color: '#00d4ff',
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 12,
  },
  authLabel: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
});
