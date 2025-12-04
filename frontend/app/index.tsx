import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="cube" size={48} color="#00d4ff" />
        <Text style={styles.title}>ZK-IoTChain</Text>
        <Text style={styles.subtitle}>Blockchain-Enabled IoT Security</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="shield-checkmark" size={32} color="#00d4ff" />
          <Text style={styles.featureTitle}>Zero-Knowledge Proofs</Text>
          <Text style={styles.featureText}>Privacy-preserving authentication</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="git-network" size={32} color="#00d4ff" />
          <Text style={styles.featureTitle}>Merkle Tree Anchoring</Text>
          <Text style={styles.featureText}>Tamper-evident data integrity</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="logo-bitcoin" size={32} color="#00d4ff" />
          <Text style={styles.featureTitle}>Sepolia Testnet</Text>
          <Text style={styles.featureText}>Ethereum smart contracts</Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/home')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color="#000" />
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>Prototype for Academic Research</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    gap: 24,
  },
  feature: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  footer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
});
