import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getPendingData,
  anchorMerkleRoot,
  getMerkleBatches,
  verifyDataIntegrity,
} from '../../utils/api';

export default function VerifyScreen() {
  const [pendingCount, setPendingCount] = useState(0);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [anchoring, setAnchoring] = useState(false);

  // Verification form
  const [dataHash, setDataHash] = useState('');
  const [batchId, setBatchId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const loadData = async () => {
    try {
      const [pendingData, batchesData] = await Promise.all([
        getPendingData(),
        getMerkleBatches(),
      ]);
      setPendingCount(pendingData.pending_count);
      setBatches(batchesData.batches);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAnchor = async () => {
    if (pendingCount === 0) {
      Alert.alert('No Data', 'No pending data to anchor');
      return;
    }

    Alert.alert(
      'Confirm Anchoring',
      `Anchor ${pendingCount} data entries to blockchain?\n\nThis will create a Merkle tree and store the root on-chain.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Anchor',
          onPress: async () => {
            setAnchoring(true);
            try {
              const result = await anchorMerkleRoot();
              Alert.alert(
                'Success',
                `Merkle root anchored!\n\nBatch ID: ${result.batch_id}\nData Count: ${result.data_count}\nGas Used: ${result.blockchain?.gas_used || 'N/A'}`
              );
              loadData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Anchoring failed');
            } finally {
              setAnchoring(false);
            }
          },
        },
      ]
    );
  };

  const handleVerify = async () => {
    if (!dataHash || !batchId) {
      Alert.alert('Error', 'Please enter both data hash and batch ID');
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyDataIntegrity({
        data_hash: dataHash,
        batch_id: parseInt(batchId),
      });
      setVerificationResult(result);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
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
        {/* Pending Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Merkle Tree Anchoring</Text>
          <View style={styles.pendingCard}>
            <View style={styles.pendingHeader}>
              <Ionicons name="time" size={32} color="#ffaa00" />
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingCount}>{pendingCount}</Text>
                <Text style={styles.pendingLabel}>Pending Data Entries</Text>
              </View>
            </View>
            <Text style={styles.pendingDescription}>
              These entries are waiting to be batched into a Merkle tree and anchored on the
              blockchain.
            </Text>
            <TouchableOpacity
              style={[styles.anchorButton, anchoring && styles.buttonDisabled]}
              onPress={handleAnchor}
              disabled={anchoring || pendingCount === 0}
            >
              {anchoring ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="git-network" size={20} color="#000" />
                  <Text style={styles.anchorButtonText}>Anchor to Blockchain</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Batches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Batches</Text>
          {batches.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="layers-outline" size={48} color="#444" />
              <Text style={styles.emptyText}>No batches yet</Text>
            </View>
          ) : (
            batches.slice(0, 5).map((batch, index) => (
              <View key={index} style={styles.batchCard}>
                <View style={styles.batchHeader}>
                  <Ionicons name="layers" size={24} color="#00d4ff" />
                  <View style={styles.batchInfo}>
                    <Text style={styles.batchId}>Batch #{batch.batch_id}</Text>
                    <Text style={styles.batchDate}>
                      {new Date(batch.timestamp * 1000).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.batchDetails}>
                  <View style={styles.batchRow}>
                    <Text style={styles.batchLabel}>Data Count:</Text>
                    <Text style={styles.batchValue}>{batch.data_count}</Text>
                  </View>
                  <View style={styles.batchRow}>
                    <Text style={styles.batchLabel}>Merkle Root:</Text>
                    <Text style={styles.batchValue} numberOfLines={1}>
                      {batch.merkle_root.substring(0, 16)}...
                    </Text>
                  </View>
                  {batch.gas_used && (
                    <View style={styles.batchRow}>
                      <Text style={styles.batchLabel}>Gas Used:</Text>
                      <Text style={styles.batchValue}>{batch.gas_used}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Integrity Verification</Text>
          <View style={styles.verifyCard}>
            <Text style={styles.verifyDescription}>
              Verify that your data hasn't been tampered with using Merkle proofs.
            </Text>

            <Text style={styles.inputLabel}>Data Hash</Text>
            <TextInput
              style={styles.input}
              value={dataHash}
              onChangeText={setDataHash}
              placeholder="Enter data hash"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Batch ID</Text>
            <TextInput
              style={styles.input}
              value={batchId}
              onChangeText={setBatchId}
              placeholder="Enter batch ID"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.verifyButton, verifying && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#000" />
                  <Text style={styles.verifyButtonText}>Verify Integrity</Text>
                </>
              )}
            </TouchableOpacity>

            {verificationResult && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: verificationResult.is_valid ? '#00ff8822' : '#ff000022',
                    borderColor: verificationResult.is_valid ? '#00ff88' : '#ff0000',
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  <Ionicons
                    name={verificationResult.is_valid ? 'checkmark-circle' : 'close-circle'}
                    size={32}
                    color={verificationResult.is_valid ? '#00ff88' : '#ff0000'}
                  />
                  <Text
                    style={[
                      styles.resultTitle,
                      { color: verificationResult.is_valid ? '#00ff88' : '#ff0000' },
                    ]}
                  >
                    {verificationResult.is_valid ? 'Valid' : 'Invalid'}
                  </Text>
                </View>
                <Text style={styles.resultMessage}>{verificationResult.message}</Text>
              </View>
            )}
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
  content: {
    padding: 16,
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
  pendingCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingCount: {
    color: '#ffaa00',
    fontSize: 32,
    fontWeight: 'bold',
  },
  pendingLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  pendingDescription: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  anchorButton: {
    flexDirection: 'row',
    backgroundColor: '#00d4ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  anchorButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  batchCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 12,
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  batchInfo: {
    flex: 1,
  },
  batchId: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  batchDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  batchDetails: {
    gap: 8,
  },
  batchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batchLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  batchValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  verifyDescription: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#00d4ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  verifyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultMessage: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
});
