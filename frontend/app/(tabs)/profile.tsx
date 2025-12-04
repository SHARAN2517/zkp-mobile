import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuditVerifyScreen() {
  const [verificationMethod, setVerificationMethod] = useState('ipfs');
  const [ipfsHash, setIpfsHash] = useState('');
  const [merkleRoot, setMerkleRoot] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!ipfsHash || !merkleRoot) {
      Alert.alert('Error', 'Please enter both IPFS Hash and Merkle Root');
      return;
    }

    setVerifying(true);
    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock verification result
      setVerificationResult({
        status: 'verified',
        ipfs_hash: ipfsHash,
        merkle_root: merkleRoot,
        timestamp: new Date().toLocaleString(),
        integrity: 'intact',
      });

      Alert.alert('Success', 'Data integrity verified successfully!');
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={48} color="#0dcaf0" />
          <Text style={styles.title}>Audit & Verify</Text>
          <Text style={styles.subtitle}>
            Verify data integrity using Merkle tree proofs
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Left Column - Verification Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Verify Data Integrity</Text>

            {/* Verification Method */}
            <Text style={styles.label}>Verification Method</Text>
            <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  verificationMethod === 'ipfs' && styles.methodButtonActive,
                ]}
                onPress={() => setVerificationMethod('ipfs')}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    verificationMethod === 'ipfs' && styles.methodButtonTextActive,
                  ]}
                >
                  By IPFS Hash
                </Text>
              </TouchableOpacity>
            </View>

            {/* IPFS Hash Input */}
            <Text style={[styles.label, { marginTop: 24 }]}>IPFS Hash</Text>
            <TextInput
              style={styles.input}
              value={ipfsHash}
              onChangeText={setIpfsHash}
              placeholder="Qm..."
              placeholderTextColor="#666"
            />

            {/* Merkle Root Input */}
            <Text style={[styles.label, { marginTop: 16 }]}>On-chain Merkle Root</Text>
            <TextInput
              style={styles.input}
              value={merkleRoot}
              onChangeText={setMerkleRoot}
              placeholder="0x..."
              placeholderTextColor="#666"
            />

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.verifyButtonText}>Verify Integrity</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Verification Result */}
            {verificationResult && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#20c997" />
                  <Text style={styles.resultTitle}>Verification Successful</Text>
                </View>
                <View style={styles.resultDetails}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Status:</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>VERIFIED</Text>
                    </View>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Integrity:</Text>
                    <Text style={styles.resultValue}>intact</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Timestamp:</Text>
                    <Text style={styles.resultValue}>{verificationResult.timestamp}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Right Column - How It Works */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>How Verification Works</Text>

            <View style={styles.stepsList}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Retrieve data from off-chain storage (IPFS)</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Recalculate Merkle tree from retrieved data</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Compare computed root with on-chain anchor</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Confirm integrity status</Text>
                </View>
              </View>
            </View>

            {/* Tamper Detection Banner */}
            <View style={styles.tamperBanner}>
              <Ionicons name="alert-circle" size={20} color="#20c997" />
              <View style={styles.tamperText}>
                <Text style={styles.tamperTitle}>✓ Tamper Detection:</Text>
                <Text style={styles.tamperSubtitle}>
                  Any modification to the data will result in a different Merkle root, instantly detecting tampering.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212529',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#adb5bd',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  mainContent: {
    gap: 24,
  },
  formSection: {
    backgroundColor: '#343a40',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoSection: {
    backgroundColor: '#2c3135',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(13, 202, 240, 0.2)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 8,
    fontWeight: '500',
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2c3135',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: 'rgba(13, 202, 240, 0.1)',
    borderColor: '#0dcaf0',
  },
  methodButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  methodButtonTextActive: {
    color: '#0dcaf0',
  },
  input: {
    backgroundColor: '#2c3135',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#6f42c1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultSection: {
    marginTop: 24,
    backgroundColor: 'rgba(32, 201, 151, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#20c997',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#20c997',
  },
  resultDetails: {
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#adb5bd',
  },
  resultValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  verifiedBadge: {
    backgroundColor: '#20c997',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0dcaf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 14,
    color: '#adb5bd',
    lineHeight: 20,
  },
  tamperBanner: {
    backgroundColor: 'rgba(32, 201, 151, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#20c997',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  tamperText: {
    flex: 1,
  },
  tamperTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20c997',
    marginBottom: 4,
  },
  tamperSubtitle: {
    fontSize: 12,
    color: '#adb5bd',
    lineHeight: 18,
  },
});
