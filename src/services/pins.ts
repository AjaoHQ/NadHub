import { Linking, Platform } from 'react-native';
import { db } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { PinLocation } from '../types/pins';

// --- Shop Pin Management ---

export const getShopPin = async (shopId: string): Promise<PinLocation | null> => {
    try {
        const docRef = doc(db, 'shops', shopId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const rawPin = data.pin;
            if (!rawPin) return null;

            // Normalize to ensure lat/lng exist
            return {
                ...rawPin,
                lat: rawPin.lat ?? rawPin.latitude ?? 0,
                lng: rawPin.lng ?? rawPin.longitude ?? 0,
                latitude: rawPin.latitude ?? rawPin.lat ?? 0,
                longitude: rawPin.longitude ?? rawPin.lng ?? 0,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching shop pin:", error);
        return null;
    }
};

export const saveShopPin = async (shopId: string, pinData: PinLocation) => {
    try {
        const docRef = doc(db, 'shops', shopId);
        const payload = {
            pin: {
                ...pinData,
                updatedAt: Date.now()
            }
        };

        // Merge with existing shop data
        await setDoc(docRef, payload, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving shop pin:", error);
        return false;
    }
};

// --- Navigation Utilities ---

export const openNavigationApp = (latitude: number, longitude: number, label: string = 'Destination') => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;

    const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
    }) || '';

    if (url) {
        Linking.openURL(url).catch(err => console.error('An error occurred opening the map', err));
    }
};
