import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface MapPickerProps {
    initialRegion?: Region; // Starting view
    initialPin?: { lat: number; lng: number }; // Initial pin position
    label?: string;
    placeholderNote?: string;
    onConfirm: (location: { lat: number; lng: number }, note: string) => void;
    onCancel: () => void;
    editable?: boolean;
}

export const MapPicker: React.FC<MapPickerProps> = ({
    initialRegion,
    initialPin,
    label = "ปักหมุดตำแหน่ง",
    placeholderNote = "ใส่จุดสังเกต (เช่น หน้าตึก/ซอย)",
    onConfirm,
    onCancel,
    editable = true
}) => {
    const [region, setRegion] = useState<Region>(initialRegion || {
        latitude: 13.7563,
        longitude: 100.5018,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
    });

    const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number }>(
        initialPin || { lat: 13.7563, lng: 100.5018 }
    );

    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(!initialRegion);

    useEffect(() => {
        if (!initialRegion && !initialPin) {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLoading(false);
                    return;
                }
                let location = await Location.getCurrentPositionAsync({});
                const currentRegion = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                };
                setRegion(currentRegion);
                setPinLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
                setLoading(false);
            })();
        } else {
            setLoading(false);
        }
    }, []);

    const handleRegionChangeComplete = (newRegion: Region) => {
        if (editable) {
            setRegion(newRegion);
            // Center pin always stays in center of map
            setPinLocation({ lat: newRegion.latitude, lng: newRegion.longitude });
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#36D873" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{label}</Text>
                <TouchableOpacity onPress={onCancel}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={region}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    scrollEnabled={editable}
                    zoomEnabled={editable}
                    pitchEnabled={false}
                    rotateEnabled={false}
                />

                {/* Fixed Center Marker */}
                <View style={styles.centerMarkerContainer} pointerEvents="none">
                    <Ionicons name="location" size={40} color="#FF5C5C" />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.coordsText}>
                    {pinLocation.lat.toFixed(6)}, {pinLocation.lng.toFixed(6)}
                </Text>

                {editable && (
                    <TextInput
                        style={styles.input}
                        placeholder={placeholderNote}
                        placeholderTextColor="#8FA3A3"
                        value={note}
                        onChangeText={setNote}
                    />
                )}

                <TouchableOpacity
                    style={[styles.confirmButton, !editable && styles.disabledButton]}
                    onPress={() => onConfirm(pinLocation, note)}
                    disabled={!editable}
                >
                    <Text style={styles.confirmButtonText}>ยืนยันตำแหน่ง</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#02090A',
    },
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    centerMarkerContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20, // Half of size
        marginLeft: -20, // Half of size
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        backgroundColor: '#02090A',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#1E3C33',
    },
    coordsText: {
        color: '#8FA3A3',
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#0F1A1A',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    confirmButton: {
        backgroundColor: '#36D873',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#263B3B',
        opacity: 0.7,
    },
    confirmButtonText: {
        color: '#001010',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
