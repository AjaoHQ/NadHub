import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { PinLocation } from '../types/pins';

interface MapPickerProps {
    initialRegion?: Region; // Starting view
    initialPin?: PinLocation; // Initial pin position
    label?: string;
    placeholderNote?: string;
    onConfirm: (location: PinLocation) => void | Promise<void>;
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
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
    });

    const [pinLocation, setPinLocation] = useState<PinLocation>(
        initialPin || { latitude: 13.7563, longitude: 100.5018, lat: 13.7563, lng: 100.5018 }
    );

    const [addressText, setAddressText] = useState(initialPin?.addressText || "");
    const [loading, setLoading] = useState(!initialRegion && !initialPin);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const mapRef = useRef<MapView>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

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
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005
                };
                setRegion(currentRegion);
                setPinLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                });
                setLoading(false);
                fetchAddress(location.coords.latitude, location.coords.longitude);
            })();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            setIsGeocoding(true);
            const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (result.length > 0) {
                const addr = result[0];
                const formattedAddress = [
                    addr.name,
                    addr.street,
                    addr.subregion,
                    addr.region
                ].filter(Boolean).join(", ");
                setAddressText(formattedAddress);
            }
        } catch (error) {
            console.log("Geocoding failed", error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleRegionChangeComplete = (newRegion: Region) => {
        if (editable) {
            setRegion(newRegion);
            // Center pin always stays in center of map
            const newPin = {
                latitude: newRegion.latitude,
                longitude: newRegion.longitude,
                lat: newRegion.latitude,
                lng: newRegion.longitude
            };
            setPinLocation(newPin);

            // Debounce reverse geocoding
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            debounceTimeout.current = setTimeout(() => {
                fetchAddress(newRegion.latitude, newRegion.longitude);
            }, 800);
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
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={region}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    scrollEnabled={editable}
                    zoomEnabled={editable}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                />

                {/* Fixed Center Marker */}
                <View style={styles.centerMarkerContainer} pointerEvents="none">
                    <Ionicons name="location" size={40} color="#FF5C5C" />
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.addressContainer}>
                    <Ionicons name="location-outline" size={20} color="#36D873" style={{ marginRight: 8 }} />
                    {isGeocoding ? (
                        <ActivityIndicator size="small" color="#8FA3A3" />
                    ) : (
                        <Text style={styles.addressText} numberOfLines={2}>
                            {addressText || "ไม่พบข้อมูลที่อยู่"}
                        </Text>
                    )}
                </View>
                <Text style={styles.coordsText}>
                    {(pinLocation.latitude ?? 0).toFixed(6)}, {(pinLocation.longitude ?? 0).toFixed(6)}
                </Text>

                {editable && (
                    <TextInput
                        style={styles.input}
                        placeholder={placeholderNote}
                        placeholderTextColor="#8FA3A3"
                        value={pinLocation.addressText || ""}
                        // Using state for manual override if needed, but here we keep it simple: 
                        // Actually the user wants to populate 'addressText' in the pin object.
                        // Let's assume the TextInput writes to a separate 'note' or specific address field?
                        // The prompt says: "addressText?" in formatting.
                        // Let's allow manual edit of the fetched address.
                        defaultValue={addressText}
                        onChangeText={setAddressText}
                    />
                )}

                <TouchableOpacity
                    style={[styles.confirmButton, !editable && styles.disabledButton]}
                    onPress={() => onConfirm({
                        latitude: pinLocation.latitude,
                        longitude: pinLocation.longitude,
                        lat: pinLocation.latitude || 0,
                        lng: pinLocation.longitude || 0,
                        addressText: addressText,
                        updatedAt: Date.now(),
                        note: addressText // Use addressText as note or separate field if needed
                    })}
                    disabled={!editable}
                >
                    <Text style={styles.confirmButtonText}>ยืนยันตำแหน่ง</Text>
                </TouchableOpacity>
            </View>
        </View >
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
        paddingTop: 50, // SafeArea
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
        marginTop: -36, // Adjust for icon center
        marginLeft: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        backgroundColor: '#02090A',
        padding: 16,
        paddingBottom: 30, // SafeArea
        borderTopWidth: 1,
        borderColor: '#1E3C33',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    coordsText: {
        color: '#8FA3A3',
        fontSize: 12,
        marginBottom: 12,
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
