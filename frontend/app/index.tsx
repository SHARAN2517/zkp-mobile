import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import minimalistTheme from '../utils/minimalistTheme';
import {
  TemperatureIcon,
  HumidityIcon,
  MotionIcon,
  GatewayIcon,
  BlockchainNodeIcon,
  MerkleTreeIcon,
  CircuitPattern,
} from '../components/IoTIcons';

const { width } = Dimensions.get('window');
const theme = minimalistTheme;

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />

      {/* Hero Section with 16:9 aspect ratio */}
      <View style={styles.hero}>
        {/* Background circuit pattern */}
        <View style={styles.circuitBackground}>
          <CircuitPattern size={width} color={theme.colors.primary.main} opacity={0.05} />
        </View>

        {/* Gradient overlay */}
        <View style={styles.gradientOverlay}>
          <View style={styles.heroContent}>
            {/* Merkle Tree Visualization */}
            <View style={styles.merkleContainer}>
              <MerkleTreeIcon size={120} color={theme.colors.primary.main} />
            </View>

            <Text style={styles.title}>ZK-IoTChain</Text>
            <Text style={styles.subtitle}>
              Blockchain-Powered IoT Security with Zero-Knowledge Proofs
            </Text>

            {/* IoT Device Icons */}
            <View style={styles.iotIconsRow}>
              <View style={styles.smallIconContainer}>
                <TemperatureIcon size={20} color={theme.colors.primary.main} />
              </View>
              <View style={styles.smallIconContainer}>
                <HumidityIcon size={20} color={theme.colors.primary.main} />
              </View>
              <View style={styles.smallIconContainer}>
                <MotionIcon size={20} color={theme.colors.primary.main} />
              </View>
              <View style={styles.smallIconContainer}>
                <GatewayIcon size={20} color={theme.colors.primary.main} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>

        <View style={styles.featuresGrid}>
          {/* ZKP Feature */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <BlockchainNodeIcon size={28} color={theme.colors.white} />
            </View>
            <Text style={styles.featureTitle}>Zero-Knowledge Proofs</Text>
            <Text style={styles.featureDescription}>
              Privacy-preserving authentication without revealing sensitive device credentials
            </Text>
          </View>

          {/* Merkle Tree Feature */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <MerkleTreeIcon size={32} color={theme.colors.white} />
            </View>
            <Text style={styles.featureTitle}>Merkle Tree Anchoring</Text>
            <Text style={styles.featureDescription}>
              Efficient batch verification with tamper-evident data integrity
            </Text>
          </View>

          {/* Multi-Chain Feature */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <BlockchainNodeIcon size={28} color={theme.colors.white} />
            </View>
            <Text style={styles.featureTitle}>Multi-Chain Support</Text>
            <Text style={styles.featureDescription}>
              Deploy on Ethereum, Polygon, Arbitrum, Optimism, Avalanche, and BSC
            </Text>
          </View>

          {/* IoT Integration */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <GatewayIcon size={28} color={theme.colors.white} />
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
    backgroundColor: theme.colors.gray[900],
  },

  // Hero section styles
  hero: {
    position: 'relative' as const,
    minHeight: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: theme.colors.gray[800],
    overflow: 'hidden' as const,
  },
  circuitBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.7)', // gray-900 with opacity
    paddingVertical: theme.spacing[12],
    paddingHorizontal: theme.spacing[6],
    alignItems: 'center' as const,
  },
  heroContent: {
    maxWidth: 600,
    alignItems: 'center' as const,
  },
  merkleContainer: {
    marginBottom: theme.spacing[6],
    opacity: 0.8,
  },
  title: {
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.white,
    marginBottom: theme.spacing[4],
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.gray[300],
    textAlign: 'center' as const,
    marginBottom: theme.spacing[6],
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.lg,
  },
  iotIconsRow: {
    flexDirection: 'row' as const,
    gap: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  smallIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glass.whiteStrong,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...(theme.shadows.sm as object),
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    ...(theme.shadows.primaryGlow as object),
  },
  buttonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.white,
  },

  // Section styles
  section: {
    padding: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.white,
    marginBottom: theme.spacing[6],
    textAlign: 'center' as const,
  },

  // Feature cards with glassmorphism
  featuresGrid: {
    gap: theme.spacing[4],
  },
  featureCard: {
    ...(theme.glassmorphism.dark as object),
    padding: theme.spacing[5],
    borderRadius: theme.borderRadius.xl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.glass.whiteStrong,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing[4],
  },
  iconContainerPrimary: {
    backgroundColor: theme.colors.primary.main,
  },
  featureTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.white,
    marginBottom: theme.spacing[2],
  },
  featureDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[300],
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.sm,
  },

  // Steps styles
  stepsContainer: {
    gap: theme.spacing[4],
  },
  step: {
    flexDirection: 'row' as const,
    gap: theme.spacing[4],
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...(theme.shadows.md as object),
  },
  stepNumberText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.white,
    marginBottom: theme.spacing[1],
  },
  stepDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[300],
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.sm,
  },

  // Stats section with glassmorphism
  statsSection: {
    flexDirection: 'row' as const,
    ...(theme.glassmorphism.primary as object),
    padding: theme.spacing[6],
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
    borderRadius: theme.borderRadius.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.gray[400],
    textTransform: 'uppercase' as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.glass.whiteStrong,
  },

  // Footer
  footer: {
    padding: theme.spacing[6],
    alignItems: 'center' as const,
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.gray[500],
    textAlign: 'center' as const,
  },
});

