import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllDevices, submitDeviceData, type Device } from '../../utils/api';

interface SensorReading {
  id: string;
  key: string;
  value: string;
  unit: string;
}

export default function SubmitDataScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([
    { id: '1', key: 'temperature', value: '', unit: '°C' },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await getAllDevices();
      setDevices(data.devices.filter((d: Device) => d.is_active));
      if (data.devices.length > 0) {
        setSelectedDeviceId(data.devices[0].device_id);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReading = () => {
    const newId = (parseInt(sensorReadings[sensorReadings.length - 1].id) + 1).toString();
    setSensorReadings([
      ...sensorReadings,
      { id: newId, key: '', value: '', unit: '' },
    ]);
  };

  const removeReading = (id: string) => {
    if (sensorReadings.length > 1) {
      setSensorReadings(sensorReadings.filter((r) => r.id !== id));
    }
  };

  const updateReading = (id: string, field: 'key' | 'value' | 'unit', value: string) => {
    setSensorReadings(
      sensorReadings.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async () => {
    if (!selectedDeviceId) {
      Alert.alert('Error', 'Please select a device');
      return;
    }

    const validReadings = sensorReadings.filter((r) => r.key && r.value);
    if (validReadings.length === 0) {
      Alert.alert('Error', 'Please add at least one sensor reading');
      return;
    }

    setSubmitting(true);
    try {
      // Convert readings to data object
      const dataObj: any = {};
      validReadings.forEach((r) => {
        const numValue = parseFloat(r.value);
        dataObj[r.key] = isNaN(numValue) ? r.value : numValue;
        if (r.unit) {
          dataObj[`${r.key}_unit`] = r.unit;
        }
      });

      await submitDeviceData({
        device_id: selectedDeviceId,
        data: dataObj,
      });

      Alert.alert(
        'Success',
        'Sensor data submitted successfully! Merkle tree will be created for batch anchoring.'
      );

      // Reset readings
      setSensorReadings([{ id: '1', key: 'temperature', value: '', unit: '°C' }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0dcaf0" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="cloud-upload" size={48} color="#0dcaf0" />
          <Text style={styles.title}>Submit Sensor Data</Text>
          <Text style={styles.subtitle}>
            Submit IoT sensor data with Merkle tree anchoring for integrity verification
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Left Column - Data Submission */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Data Submission</Text>

            {/* Device Selection */}
            <Text style={styles.label}>Select Device *</Text>
            {devices.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="hardware-chip-outline" size={32} color="#666" />
                <Text style={styles.emptyText}>No active devices found</Text>
                <Text style={styles.emptySubtext}>Register a device first</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() => setShowDevicePicker(true)}
              >
                <Text style={styles.pickerText}>
                  {selectedDeviceId
                    ? devices.find((d) => d.device_id === selectedDeviceId)?.device_name || 'Choose a registered device...'
                    : 'Choose a registered device...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#0dcaf0" />
              </TouchableOpacity>
            )}

            {/* Sensor Readings */}
            <Text style={[styles.label, { marginTop: 24 }]}>Sensor Readings</Text>
            {sensorReadings.map((reading, index) => (
              <View key={reading.id} style={styles.readingRow}>
                <TextInput
                  style={[styles.input, styles.readingKey]}
                  value={reading.key}
                  onChangeText={(value) => updateReading(reading.id, 'key', value)}
                  placeholder="e.g., temperature"
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={[styles.input, styles.readingValue]}
                  value={reading.value}
                  onChangeText={(value) => updateReading(reading.id, 'value', value)}
                  placeholder="25.5"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.readingUnit]}
                  value={reading.unit}
                  onChangeText={(value) => updateReading(reading.id, 'unit', value)}
                  placeholder="°C"
                  placeholderTextColor="#666"
                />
                {sensorReadings.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeReading(reading.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff0055" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addReading}>
              <Ionicons name="add-circle" size={18} color="#0dcaf0" />
              <Text style={styles.addButtonText}>Add Reading</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting || devices.length === 0}
            >
              {submitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="git-merge" size={20} color="#000" />
                  <Text style={styles.submitButtonText}>Create Merkle Tree & Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Right Column - Submission Process */}
          <View style={styles.processSection}>
            <Text style={styles.sectionTitle}>Submission Process</Text>

            <View style={styles.stepsList}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Select registered device</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Add sensor readings</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>System creates Merkle tree</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Merkle root anchored on blockchain</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>5</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Raw data stored off-chain (IPFS simulation)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Device Picker Modal */}
      <Modal
        visible={showDevicePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDevicePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDevicePicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Device</Text>
              <TouchableOpacity onPress={() => setShowDevicePicker(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={devices}
              keyExtractor={(item) => item.device_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.deviceOption,
                    selectedDeviceId === item.device_id && styles.deviceOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedDeviceId(item.device_id);
                    setShowDevicePicker(false);
                  }}
                >
                  <View style={styles.deviceOptionContent}>
                    <Ionicons
                      name="hardware-chip"
                      size={20}
                      color={selectedDeviceId === item.device_id ? '#0dcaf0' : '#adb5bd'}
                    />
                    <View style={styles.deviceOptionText}>
                      <Text style={styles.deviceOptionName}>{item.device_name}</Text>
                      <Text style={styles.deviceOptionId}>{item.device_id}</Text>
                    </View>
                  </View>
                  {selectedDeviceId === item.device_id && (
                    <Ionicons name="checkmark-circle" size={20} color="#0dcaf0" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212529',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#212529',
    alignItems: 'center',
    justifyContent: 'center',
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
  processSection: {
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
  pickerContainer: {
    backgroundColor: '#2c3135',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    height: 50,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#adb5bd',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  readingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
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
  readingKey: {
    flex: 2,
  },
  readingValue: {
    flex: 1.5,
  },
  readingUnit: {
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0dcaf0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addButtonText: {
    color: '#0dcaf0',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#20c997',
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
    fontWeight: '700',
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
  pickerText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#343a40',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  deviceOptionSelected: {
    backgroundColor: 'rgba(13, 202, 240, 0.1)',
  },
  deviceOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deviceOptionText: {
    flex: 1,
  },
  deviceOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  deviceOptionId: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
});

