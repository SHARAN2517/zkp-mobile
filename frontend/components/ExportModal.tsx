import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExportModalProps {
    visible: boolean;
    onClose: () => void;
    exportType: 'devices' | 'sensor_data' | 'verification_records';
    data: any[];
}

export default function ExportModal({ visible, onClose, exportType, data }: ExportModalProps) {
    const [format, setFormat] = useState<'json' | 'csv'>('json');
    const [exporting, setExporting] = useState(false);

    const generateFileName = () => {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        return `zkp_${exportType}_${timestamp}.${format}`;
    };

    const convertToCSV = (data: any[]): string => {
        if (data.length === 0) return '';

        // Get all unique keys from data
        const headers = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));

        // CSV header row
        const csvHeaders = headers.join(',');

        // CSV data rows
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const stringValue = value !== undefined && value !== null ? String(value) : '';
                return stringValue.includes(',') || stringValue.includes('"')
                    ? `"${stringValue.replace(/"/g, '""')}"`
                    : stringValue;
            }).join(',');
        }).join('\n');

        return `${csvHeaders}\n${csvRows}`;
    };

    const handleExport = async () => {
        setExporting(true);

        try {
            const fileName = generateFileName();
            let content: string;
            let mimeType: string;

            if (format === 'json') {
                content = JSON.stringify({
                    export_date: new Date().toISOString(),
                    export_type: exportType,
                    total_records: data.length,
                    data: data,
                }, null, 2);
                mimeType = 'application/json';
            } else {
                content = convertToCSV(data);
                mimeType = 'text/csv';
            }

            // For React Native, we would use react-native-fs or expo-file-system
            // For now, show success message
            const fileSize = new Blob([content]).size;
            const fileSizeKB = (fileSize / 1024).toFixed(2);

            Alert.alert(
                'Export Successful',
                `File: ${fileName}\nSize: ${fileSizeKB} KB\n\nIn production, this would download to your device.`,
                [{ text: 'OK', onPress: onClose }]
            );
        } catch (error) {
            Alert.alert('Export Failed', 'An error occurred while exporting data');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Ionicons name="download" size={24} color="#0dcaf0" />
                            <Text style={styles.title}>Export Data</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Export Type Info */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>Export Type:</Text>
                            <Text style={styles.infoValue}>{exportType.replace(/_/g, ' ').toUpperCase()}</Text>
                            <Text style={styles.infoLabel}>Records:</Text>
                            <Text style={styles.infoValue}>{data.length}</Text>
                        </View>

                        {/* Format Selector */}
                        <Text style={styles.sectionTitle}>Select Format</Text>
                        <View style={styles.formatSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.formatButton,
                                    format === 'json' && styles.formatButtonActive,
                                ]}
                                onPress={() => setFormat('json')}
                            >
                                <Ionicons
                                    name="code-slash"
                                    size={24}
                                    color={format === 'json' ? '#0dcaf0' : '#6c757d'}
                                />
                                <Text
                                    style={[
                                        styles.formatButtonText,
                                        format === 'json' && styles.formatButtonTextActive,
                                    ]}
                                >
                                    JSON
                                </Text>
                                <Text style={styles.formatDescription}>Structured data</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.formatButton,
                                    format === 'csv' && styles.formatButtonActive,
                                ]}
                                onPress={() => setFormat('csv')}
                            >
                                <Ionicons
                                    name="grid"
                                    size={24}
                                    color={format === 'csv' ? '#0dcaf0' : '#6c757d'}
                                />
                                <Text
                                    style={[
                                        styles.formatButtonText,
                                        format === 'csv' && styles.formatButtonTextActive,
                                    ]}
                                >
                                    CSV
                                </Text>
                                <Text style={styles.formatDescription}>Spreadsheet</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Preview */}
                        <Text style={styles.sectionTitle}>File Preview</Text>
                        <View style={styles.previewCard}>
                            <View style={styles.previewRow}>
                                <Ionicons name="document" size={20} color="#0dcaf0" />
                                <Text style={styles.previewFileName}>{generateFileName()}</Text>
                            </View>
                            <Text style={styles.previewInfo}>
                                Format: {format.toUpperCase()} • Records: {data.length}
                            </Text>
                        </View>

                        {/* Export Button */}
                        <TouchableOpacity
                            style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
                            onPress={handleExport}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="download" size={20} color="#fff" />
                                    <Text style={styles.exportButtonText}>Export {format.toUpperCase()}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        padding: 20,
    },
    infoCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    infoLabel: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 8,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    formatSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    formatButton: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        borderWidth: 2,
        borderColor: '#2a2a2a',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        gap: 8,
    },
    formatButtonActive: {
        borderColor: '#0dcaf0',
        backgroundColor: 'rgba(13, 202, 240, 0.1)',
    },
    formatButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6c757d',
    },
    formatButtonTextActive: {
        color: '#0dcaf0',
    },
    formatDescription: {
        fontSize: 12,
        color: '#6c757d',
    },
    previewCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    previewFileName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        flex: 1,
    },
    previewInfo: {
        fontSize: 12,
        color: '#aaa',
    },
    exportButton: {
        flexDirection: 'row',
        backgroundColor: '#20c997',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    exportButtonDisabled: {
        opacity: 0.5,
    },
    exportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
