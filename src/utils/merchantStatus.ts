import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, MerchantProfile, MERCHANT_STATUS } from '../store/auth';

const MERCHANT_STATUS_PREFIX = "nadHub_merchant_isOpen_";
const USERS_DB_KEY = "nadHubUsers";

export const getMerchantStatus = async (merchantId: string): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(`${MERCHANT_STATUS_PREFIX}${merchantId}`);
        // Default to true (open) if not set
        return value !== 'false';
    } catch (error) {
        console.error("Error getting merchant status:", error);
        return true;
    }
};

export const setMerchantStatus = async (merchantId: string, isOpen: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(`${MERCHANT_STATUS_PREFIX}${merchantId}`, String(isOpen));
    } catch (error) {
        console.error("Error setting merchant status:", error);
    }
};

export const getMerchantDetails = async (merchantId: string) => {
    try {
        const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
        const usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];
        const merchant = usersDb.find(u => u.id === merchantId) as MerchantProfile | undefined;

        if (merchant) {
            return {
                isOpen: merchant.isOpen ?? true,
                merchantStatus: merchant.merchantStatus || MERCHANT_STATUS.PENDING
            };
        }
        return null;
    } catch (error) {
        console.error("Error getting merchant details:", error);
        return null;
    }
};
