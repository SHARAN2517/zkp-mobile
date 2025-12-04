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
// import { WalletConnect } from '../../components'; // Commented out - requires @walletconnect/ethereum-provider package


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
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>Loading metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.title}>ZK-IoTChain Dashboard</Text>
          </View>
          <Ionicons name="cube" size={40} color="#00d4ff" />
        </View>

        {/* Wallet Connect - Requires @walletconnect/ethereum-provider package */}
        {/* <WalletConnect /> */}

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

        {/* Authentication Stats */}
        <View style={styles.section}>
          <View style={styles.authCard}>
            <Ionicons name="shield-checkmark" size={48} color="#00d4ff" />
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
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: '#888',
    fontSize: 14,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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
