import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="cube" size={48} color="#00d4ff" />
          </View>
          <Text style={styles.title}>ZK-IoTChain</Text>
          <Text style={styles.subtitle}>Research Prototype v1.0.0</Text>
        </View>

        {/* Features Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featureCard}>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color="#00d4ff" />
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Zero-Knowledge Proofs</Text>
                <Text style={styles.featureDescription}>
                  Privacy-preserving device authentication without exposing secrets
                </Text>
              </View>
            </View>
            <View style={styles.feature}>
              <Ionicons name="git-network" size={24} color="#00ff88" />
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Merkle Tree Anchoring</Text>
                <Text style={styles.featureDescription}>
                  Off-chain data storage with on-chain integrity verification
                </Text>
              </View>
            </View>
            <View style={styles.feature}>
              <Ionicons name="logo-bitcoin" size={24} color="#ffaa00" />
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Ethereum Smart Contracts</Text>
                <Text style={styles.featureDescription}>
                  Deployed on Sepolia testnet with gas optimization
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Technical Stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Stack</Text>
          <View style={styles.techCard}>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Frontend:</Text>
              <Text style={styles.techValue}>Expo (React Native)</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Backend:</Text>
              <Text style={styles.techValue}>FastAPI (Python)</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Blockchain:</Text>
              <Text style={styles.techValue}>Ethereum Sepolia</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Smart Contracts:</Text>
              <Text style={styles.techValue}>Solidity 0.8.20</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>ZKP Library:</Text>
              <Text style={styles.techValue}>SnarkJS (Simplified)</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Database:</Text>
              <Text style={styles.techValue}>MongoDB</Text>
            </View>
          </View>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Research Objectives</Text>
          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveText}>
              • ZKP-based IoT device identity verification
            </Text>
            <Text style={styles.objectiveText}>
              • Merkle tree data anchoring for tamper-evident integrity
            </Text>
            <Text style={styles.objectiveText}>
              • Reduce blockchain storage costs via off-chain storage
            </Text>
            <Text style={styles.objectiveText}>
              • Evaluate gas consumption and latency metrics
            </Text>
            <Text style={styles.objectiveText}>
              • Demonstrate resistance to spoofing and replay attacks
            </Text>
          </View>
        </View>

        {/* Applications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported IoT Applications</Text>
          <View style={styles.appGrid}>
            <View style={styles.appCard}>
              <Ionicons name="fitness" size={32} color="#00ff88" />
              <Text style={styles.appName}>Healthcare</Text>
              <Text style={styles.appDescription}>Medical sensors, patient monitoring</Text>
            </View>
            <View style={styles.appCard}>
              <Ionicons name="construct" size={32} color="#ffaa00" />
              <Text style={styles.appName}>Industrial</Text>
              <Text style={styles.appDescription}>Factory automation, equipment tracking</Text>
            </View>
            <View style={styles.appCard}>
              <Ionicons name="business" size={32} color="#00d4ff" />
              <Text style={styles.appName}>Smart Cities</Text>
              <Text style={styles.appDescription}>Traffic, environment monitoring</Text>
            </View>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://sepolia.etherscan.io/')}
          >
            <Ionicons name="globe" size={20} color="#00d4ff" />
            <Text style={styles.linkText}>Sepolia Etherscan</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://sepoliafaucet.com/')}
          >
            <Ionicons name="water" size={20} color="#00d4ff" />
            <Text style={styles.linkText}>Get Sepolia ETH</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Built for Academic Research</Text>
          <Text style={styles.footerSubtext}>
            Blockchain-Enabled IoT Security Framework with Zero-Knowledge Proofs
          </Text>
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
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
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
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  techCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  techLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  techValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  objectiveCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  objectiveText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  appCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  appName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  appDescription: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 8,
    gap: 12,
  },
  linkText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
