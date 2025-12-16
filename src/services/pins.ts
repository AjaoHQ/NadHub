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
            return data.pin || null;
        }
        return null;
    } catch (error) {
        console.error("Error fetching shop pin:", error);
        return null;
    }
};

export const saveShopPin = async (shopId: string, location: { lat: number; lng: number }, address?: string) => {
    try {
        const docRef = doc(db, 'shops', shopId);
        const pinData: PinLocation = {
            lat: location.lat,
            lng: location.lng,
            address: address || '',
            updatedAt: Date.now()
        };

        // Merge with existing shop data
        await setDoc(docRef, { pin: pinData }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving shop pin:", error);
        return false;
    }
};

// --- Navigation Utilities ---

export const openNavigationApp = (lat: number, lng: number, label: string = 'Destination') => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;

    const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
    }) || '';

    if (url) {
        Linking.openURL(url).catch(err => console.error('An error occurred opening the map', err));
    }
};
