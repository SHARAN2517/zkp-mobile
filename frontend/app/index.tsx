import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Ionicons name="cube-outline" size={72} color="#0dcaf0" style={styles.logo} />
          <Text style={styles.title}>ZK-IoTChain</Text>
          <Text style={styles.subtitle}>Blockchain-Enabled IoT Security with Zero-Knowledge Proofs</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/home')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>

        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#0dcaf0" />
            </View>
            <Text style={styles.featureTitle}>Zero-Knowledge Proofs</Text>
            <Text style={styles.featureDescription}>
              Privacy-preserving authentication without revealing sensitive device credentials
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="git-network" size={32} color="#0dcaf0" />
            </View>
            <Text style={styles.featureTitle}>Merkle Tree Anchoring</Text>
            <Text style={styles.featureDescription}>
              Efficient batch verification with tamper-evident data integrity
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="logo-bitcoin" size={32} color="#0dcaf0" />
            </View>
            <Text style={styles.featureTitle}>Ethereum Integration</Text>
            <Text style={styles.featureDescription}>
              Smart contracts deployed on Sepolia testnet for transparent verification
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="server" size={32} color="#20c997" />
            </View>
            <Text style={styles.featureTitle}>Scalable Architecture</Text>
            <Text style={styles.featureDescription}>
              FastAPI backend with MongoDB for high-performance IoT data management
            </Text>
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Device Registration</Text>
              <Text style={styles.stepDescription}>
                IoT devices register with ZKP-based authentication, storing proofs on-chain
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Data Submission</Text>
              <Text style={styles.stepDescription}>
                Authenticated devices submit sensor data to the backend API
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Merkle Anchoring</Text>
              <Text style={styles.stepDescription}>
                Data is batched into Merkle trees and roots are anchored to Ethereum
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verification</Text>
              <Text style={styles.stepDescription}>
                Anyone can verify data authenticity using Merkle proofs and blockchain records
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>256-bit</Text>
          <Text style={styles.statLabel}>Encryption</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>100%</Text>
          <Text style={styles.statLabel}>Private</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Testnet</Text>
          <Text style={styles.statLabel}>Ready</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Academic Research Prototype • Created for Educational Purposes</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212529',
  },
  hero: {
    backgroundColor: '#2c3135',
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 600,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#adb5bd',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#0dcaf0',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#343a40',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 202, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#adb5bd',
    lineHeight: 22,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0dcaf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#adb5bd',
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#343a40',
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0dcaf0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
});
