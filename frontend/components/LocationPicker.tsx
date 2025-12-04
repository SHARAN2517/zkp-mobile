import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (location: HierarchicalLocation) => void;
    selectedLocation?: HierarchicalLocation;
}

export interface HierarchicalLocation {
    building: string;
    floor: string;
    room: string;
}

const SAMPLE_LOCATIONS = {
    buildings: ['Building A', 'Building B', 'Building C', 'Main Office'],
    floors: {
        'Building A': ['Floor 1', 'Floor 2', 'Floor 3'],
        'Building B': ['Ground Floor', 'First Floor'],
        'Building C': ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
        'Main Office': ['Ground', 'Mezzanine', 'Upper'],
    },
    rooms: {
        'Floor 1': ['Room 101', 'Room 102', 'Room 103', 'Room 104'],
        'Floor 2': ['Room 201', 'Room 202', 'Room 203'],
        'Floor 3': ['Room 301', 'Room 302', 'Room 303', 'Room 304', 'Room 305'],
        'Ground Floor': ['Lobby', 'Reception', 'Storage'],
        'First Floor': ['Office 1', 'Office 2', 'Conference Room'],
        'Level 1': ['Lab 1', 'Lab 2', 'Equipment Room'],
        'Level 2': ['Research Area', 'Testing Lab'],
        'Level 3': ['Server Room', 'Data Center'],
        'Level 4': ['Administration', 'Meeting Rooms'],
        'Ground': ['Entrance', 'Waiting Area'],
        'Mezzanine': ['Manager Office', 'Staff Room'],
        'Upper': ['Executive Suite', 'Board Room'],
    },
};

export default function LocationPicker({
    visible,
    onClose,
    onSelect,
    selectedLocation,
}: LocationPickerProps) {
    const [building, setBuilding] = useState(selectedLocation?.building || '');
    const [floor, setFloor] = useState(selectedLocation?.floor || '');
    const [room, setRoom] = useState(selectedLocation?.room || '');
    const [step, setStep] = useState<'building' | 'floor' | 'room'>('building');
    const [searchQuery, setSearchQuery] = useState('');

    const handleBuildingSelect = (selectedBuilding: string) => {
        setBuilding(selectedBuilding);
        setFloor('');
        setRoom('');
        setStep('floor');
    };

    const handleFloorSelect = (selectedFloor: string) => {
        setFloor(selectedFloor);
        setRoom('');
        setStep('room');
    };

    const handleRoomSelect = (selectedRoom: string) => {
        setRoom(selectedRoom);
        onSelect({
            building,
            floor,
            room: selectedRoom,
        });
        onClose();
    };

    const getFilteredItems = () => {
        if (step === 'building') {
            return SAMPLE_LOCATIONS.buildings.filter(b =>
                b.toLowerCase().includes(searchQuery.toLowerCase())
            );
        } else if (step === 'floor' && building) {
            const floors = (SAMPLE_LOCATIONS.floors as any)[building] || [];
            return floors.filter((f: string) =>
                f.toLowerCase().includes(searchQuery.toLowerCase())
            );
        } else if (step === 'room' && floor) {
            const rooms = (SAMPLE_LOCATIONS.rooms as any)[floor] || [];
            return rooms.filter((r: string) =>
                r.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return [];
    };

    const getStepTitle = () => {
        switch (step) {
            case 'building':
                return 'Select Building';
            case 'floor':
                return 'Select Floor';
            case 'room':
                return 'Select Room';
        }
    };

    const handleBack = () => {
        if (step === 'floor') {
            setStep('building');
            setFloor('');
            setRoom('');
        } else if (step === 'room') {
            setStep('floor');
            setRoom('');
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
                            {step !== 'building' && (
                                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                    <Ionicons name="arrow-back" size={24} color="#0dcaf0" />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.title}>{getStepTitle()}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Breadcrumb */}
                    {(building || floor || room) && (
                        <View style={styles.breadcrumb}>
                            <Text style={styles.breadcrumbText}>
                                {building}
                                {floor && ` > ${floor}`}
                                {room && ` > ${room}`}
                            </Text>
                        </View>
                    )}

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search ${step}s...`}
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* List */}
                    <FlatList
                        data={getFilteredItems()}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.locationItem}
                                onPress={() => {
                                    if (step === 'building') handleBuildingSelect(item);
                                    else if (step === 'floor') handleFloorSelect(item);
                                    else if (step === 'room') handleRoomSelect(item);
                                }}
                            >
                                <View style={styles.locationItemContent}>
                                    <Ionicons
                                        name={
                                            step === 'building'
                                                ? 'business'
                                                : step === 'floor'
                                                    ? 'layers'
                                                    : 'location'
                                        }
                                        size={20}
                                        color="#0dcaf0"
                                    />
                                    <Text style={styles.locationItemText}>{item}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No {step}s found</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );
}

export function formatLocation(location: HierarchicalLocation): string {
    return `${location.building} > ${location.floor} > ${location.room}`;
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
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    breadcrumb: {
        padding: 16,
        backgroundColor: 'rgba(13, 202, 240, 0.1)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(13, 202, 240, 0.2)',
    },
    breadcrumbText: {
        fontSize: 14,
        color: '#0dcaf0',
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 12,
        margin: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    locationItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    locationItemText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});
