import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getAllDevices,
  registerDevice,
  authenticateDevice,
  submitDeviceData,
  type Device,
} from '../../utils/api';

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Registration form
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('healthcare');
  const [secret, setSecret] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Data submission form
  const [dataValue, setDataValue] = useState('');

  const loadDevices = async () => {
    try {
      const data = await getAllDevices();
      setDevices(data.devices);
    } catch (error) {
      console.error('Failed to load devices:', error);
      Alert.alert('Error', 'Failed to load devices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDevices();
  };

  const handleRegister = async () => {
    if (!deviceId || !deviceName || !secret) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerDevice({
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
        secret: secret,
      });

      // Store registration result and show success modal
      setRegistrationResult({
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
        location: location || 'N/A',
        public_key: result.public_key || 'Generated',
        public_key_hash: result.public_key_hash || result.commitment || 'N/A',
        created_at: new Date().toLocaleString(),
        storage: 'LOCAL',
      });

      setShowRegisterModal(false);
      setShowSuccessModal(true);

      // Clear form
      setDeviceId('');
      setDeviceName('');
      setLocation('');
      setSecret('');

      loadDevices();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const generateDeviceId = () => {
    // Generate unique device ID: DEV-{timestamp}-{random}
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueId = `DEV-${timestamp}-${random}`;
    setDeviceId(uniqueId);
  };

  const handleAuthenticate = async () => {
    if (!selectedDevice || !secret) {
      Alert.alert('Error', 'Please enter device secret');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authenticateDevice({
        device_id: selectedDevice.device_id,
        secret: secret,
      });

      Alert.alert('Success', 'Device authenticated successfully!');
      setShowAuthModal(false);
      setSecret('');
      setSelectedDevice(null);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitData = async () => {
    if (!selectedDevice || !dataValue) {
      Alert.alert('Error', 'Please enter data value');
      return;
    }

    setSubmitting(true);
    try {
      await submitDeviceData({
        device_id: selectedDevice.device_id,
        data: {
          value: parseFloat(dataValue) || dataValue,
          sensor_type: selectedDevice.device_type,
        },
      });

      Alert.alert('Success', 'Data submitted for Merkle batching!');
      setShowDataModal(false);
      setDataValue('');
      setSelectedDevice(null);
      loadDevices();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Data submission failed');
    } finally {
      setSubmitting(false);
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
        }
      >
        <View style={styles.content}>
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="hardware-chip-outline" size={64} color="#444" />
              <Text style={styles.emptyText}>No devices registered</Text>
              <Text style={styles.emptySubtext}>Register your first IoT device to get started</Text>
            </View>
          ) : (
            devices.map((device) => (
              <View key={device.device_id} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceInfo}>
                    <Ionicons name="hardware-chip" size={24} color="#00d4ff" />
                    <View style={styles.deviceText}>
                      <Text style={styles.deviceName}>{device.device_name}</Text>
                      <Text style={styles.deviceId}>{device.device_id}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: device.is_active ? '#00ff8822' : '#ff000022' },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: device.is_active ? '#00ff88' : '#ff0000' }]}
                    >
                      {device.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.deviceDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{device.device_type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Data Submitted:</Text>
                    <Text style={styles.detailValue}>{device.total_data_submitted}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registered:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(device.registered_at * 1000).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedDevice(device);
                      setShowAuthModal(true);
                    }}
                  >
                    <Ionicons name="shield-checkmark" size={16} color="#00d4ff" />
                    <Text style={styles.actionButtonText}>Authenticate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#1a2a1a' }]}
                    onPress={() => {
                      setSelectedDevice(device);
                      setShowDataModal(true);
                    }}
                  >
                    <Ionicons name="cloud-upload" size={16} color="#00ff88" />
                    <Text style={styles.actionButtonText}>Submit Data</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowRegisterModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#000" />
      </TouchableOpacity>

      {/* Register Device Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register Device</Text>
              <TouchableOpacity onPress={() => setShowRegisterModal(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Device ID *</Text>
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={deviceId}
                  onChangeText={setDeviceId}
                  placeholder="e.g., sensor_001"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity style={styles.generateButton} onPress={generateDeviceId}>
                  <Ionicons name="sparkles" size={16} color="#000" />
                  <Text style={styles.generateButtonText}>Generate</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Unique identifier for your IoT device (alphanumeric, underscore, hyphen)</Text>

              <Text style={styles.inputLabel}>Device Name</Text>
              <TextInput
                style={styles.input}
                value={deviceName}
                onChangeText={setDeviceName}
                placeholder="e.g., Temperature Sensor"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Device Type</Text>
              <View style={styles.typeSelector}>
                {['healthcare', 'industrial', 'smart-city'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      deviceType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setDeviceType(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        deviceType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Device Secret</Text>
              <TextInput
                style={styles.input}
                value={secret}
                onChangeText={setSecret}
                placeholder="Enter secure secret"
                placeholderTextColor="#666"
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleRegister}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#000" />
                    <Text style={styles.submitButtonText}>Register with ZKP</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Authenticate Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Authenticate Device</Text>
              <TouchableOpacity onPress={() => setShowAuthModal(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.deviceInfoText}>
                Device: {selectedDevice?.device_name}
              </Text>

              <Text style={styles.inputLabel}>Device Secret</Text>
              <TextInput
                style={styles.input}
                value={secret}
                onChangeText={setSecret}
                placeholder="Enter device secret"
                placeholderTextColor="#666"
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleAuthenticate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#000" />
                    <Text style={styles.submitButtonText}>Authenticate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submit Data Modal */}
      <Modal
        visible={showDataModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDataModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Data</Text>
              <TouchableOpacity onPress={() => setShowDataModal(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.deviceInfoText}>
                Device: {selectedDevice?.device_name}
              </Text>

              <Text style={styles.inputLabel}>Data Value</Text>
              <TextInput
                style={styles.input}
                value={dataValue}
                onChangeText={setDataValue}
                placeholder="e.g., 36.5 or sensor reading"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitData}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="#000" />
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  deviceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  deviceId: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deviceDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1a2a3a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: 8,
  },
  inputFlex: {
    flex: 1,
  },
  generateButton: {
    backgroundColor: '#0dcaf0',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  generateButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#00d4ff22',
    borderColor: '#00d4ff',
  },
  typeButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#00d4ff',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#00d4ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceInfoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
});
