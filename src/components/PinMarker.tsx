import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

interface PinMarkerProps {
    coordinate: { latitude: number; longitude: number };
    type: 'pickup' | 'dropoff' | 'rider';
    title?: string;
    description?: string;
}

export const PinMarker: React.FC<PinMarkerProps> = ({ coordinate, type, title, description }) => {

    const getIcon = () => {
        switch (type) {
            case 'pickup':
                return <Ionicons name="storefront" size={24} color="#000" />;
            case 'dropoff':
                return <Ionicons name="person" size={24} color="#000" />;
            case 'rider':
                return <Ionicons name="bicycle" size={24} color="#000" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'pickup': return '#36D873'; // Green
            case 'dropoff': return '#FF5C5C'; // Red
            case 'rider': return '#FFD700'; // Gold
        }
    };

    return (
        <Marker coordinate={coordinate} title={title} description={description}>
            <View style={[styles.markerContainer, { backgroundColor: getBgColor() }]}>
                {getIcon()}
            </View>
            {/* Simple arrow helper */}
            <View style={[styles.arrow, { borderTopColor: getBgColor() }]} />
        </Marker>
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    arrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        alignSelf: 'center',
        marginTop: -1,
    }
});
