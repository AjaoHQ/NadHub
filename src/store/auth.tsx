import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = "buyer" | "merchant" | "rider" | "admin";

export enum MERCHANT_STATUS {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export function isRiderProfileComplete(user: User | null): boolean {
    if (!user || user.role !== "rider") return false;
    return !!user.isRiderProfileComplete;
}

export type Address = {
    id: string;
    label: string; // e.g., "Home", "Work"
    fullAddress: string;
    isDefault: boolean;
};

export type RiderVerificationStatus =
    | "pending_verification"
    | "approved"
    | "rejected";



export type BaseUser = {
    id: string;
    phone: string;
    displayName: string;
    buyerName?: string; // New field for buyer name
    riderName?: string; // New field for rider name
    merchantName?: string; // New field for shop name
    avatarUri?: string | null;
    image?: string | null; // Legacy field
    buyerImage?: string | null;
    merchantImage?: string | null;
    riderImage?: string | null;
    addresses?: Address[];
    addressLine?: string | null;
};

export type BuyerProfile = BaseUser & {
    role: "buyer";
};

export type MerchantProfile = BaseUser & {
    role: "merchant";
    isOpen?: boolean;
    merchantStatus?: MERCHANT_STATUS; // Status of the merchant account
    ownerName: string;
    taxId?: string;
    idCardNumber?: string;
};

export type RiderProfile = BaseUser & {
    role: "rider";
    vehicleType: "motorcycle" | "car" | "bicycle" | "other";
    plateNumber: string;
    idCardNumber: string;
    licenseNumber: string;
    verificationStatus: RiderVerificationStatus;
    isRiderProfileComplete?: boolean;
};

export type AdminProfile = BaseUser & {
    role: "admin";
};

export type UnassignedUser = BaseUser & {
    role: null;
};

export type User = BuyerProfile | MerchantProfile | RiderProfile | AdminProfile | UnassignedUser;

export type AuthState = {
    user: User | null;
    loading: boolean;
    loginWithPhone: (phone: string) => Promise<void>;
    verifyOtp: (code: string) => Promise<boolean>;
    setDisplayName: (name: string) => void;
    setRole: (role: UserRole) => void;
    updateProfile: (partial: Partial<User & {
        vehicleType?: string;
        plateNumber?: string;
        idCardNumber?: string;
        licenseNumber?: string;
        verificationStatus?: RiderVerificationStatus;
        isOpen?: boolean;
        ownerName?: string;
        taxId?: string;
        buyerImage?: string | null;
        merchantImage?: string | null;
        riderImage?: string | null;
        merchantName?: string;
        buyerName?: string;
        riderName?: string;
        isRiderProfileComplete?: boolean;
    }>) => Promise<void>;
    updateUser: (updatedUser: User) => Promise<void>;
    addAddress: (address: Omit<Address, "id">) => Promise<void>;
    removeAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const USER_STORAGE_KEY = "nadHub:user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Temp state for login flow
    const [pendingPhone, setPendingPhone] = useState<string | null>(null);
    const [pendingOtp, setPendingOtp] = useState<string | null>(null);

    const USERS_DB_KEY = "nadHubUsers";

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to load user", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            // 1. Get current user ID/Phone to identify
            const storedUserJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (!storedUserJson) return;
            const storedUser = JSON.parse(storedUserJson) as User;

            // 2. Fetch latest data from "DB"
            const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
            const usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

            // [DEV] Ensure Mock Admin Exists
            const adminPhone = "0999999999";
            if (!usersDb.find(u => u.phone === adminPhone)) {
                const mockAdmin: AdminProfile = {
                    id: "admin-001",
                    phone: adminPhone,
                    displayName: "Admin User",
                    role: "admin",
                    addresses: []
                };
                usersDb.push(mockAdmin);
                await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
                console.log("Created mock admin user");
            }

            // 3. Find user
            const latestUser = usersDb.find(u => u.id === storedUser.id);

            if (latestUser) {
                console.log("REFRESH USER", latestUser.role, (latestUser as any).isRiderProfileComplete);
                console.log("Refreshing user from DB:", latestUser);

                // Migration: Copy legacy image to role-specific fields if missing
                if (latestUser.image && !latestUser.buyerImage) latestUser.buyerImage = latestUser.image;
                if (latestUser.image && !latestUser.merchantImage) latestUser.merchantImage = latestUser.image;
                if (latestUser.image && !latestUser.riderImage) latestUser.riderImage = latestUser.image;

                // Migration: Default merchantName to displayName if missing
                if (!latestUser.merchantName) {
                    latestUser.merchantName = latestUser.displayName;
                }

                // Migration: Default buyerName/riderName to displayName if missing
                if (!latestUser.buyerName) latestUser.buyerName = latestUser.displayName;
                if (!latestUser.riderName) latestUser.riderName = latestUser.displayName;

                // Normalize merchant status
                if (latestUser.role === 'merchant') {
                    // No status normalization needed anymore
                }

                // 4. Update session and state
                setUser(latestUser);
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(latestUser));
            } else {
                // Fallback if not found in DB (shouldn't happen normally)
                await loadUser();
            }
        } catch (error) {
            console.error("Failed to refresh user", error);
        }
    };

    const loginWithPhone = async (phone: string) => {
        // Simulate sending OTP
        setPendingPhone(phone);
        setPendingOtp("123456"); // Demo OTP
        console.log(`OTP for ${phone} is 123456`);
    };

    const verifyOtp = async (code: string): Promise<boolean> => {
        if (!pendingPhone || !pendingOtp) return false;

        if (code === pendingOtp) {
            // Check if user exists in DB
            let currentUser: User;
            try {
                const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
                const usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

                const existingUser = usersDb.find(u => u.phone === pendingPhone);

                if (existingUser) {
                    console.log("Found existing user:", existingUser);
                    currentUser = existingUser;
                } else {
                    console.log("Creating new user for:", pendingPhone);
                    currentUser = {
                        id: Date.now().toString(),
                        phone: pendingPhone,
                        displayName: "",
                        role: null,
                        addresses: [],
                    } as UnassignedUser;
                    usersDb.push(currentUser);
                    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
                }

                setUser(currentUser);
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));

                // Clear pending state
                setPendingPhone(null);
                setPendingOtp(null);
                return true;
            } catch (error) {
                console.error("Error verifying OTP:", error);
                return false;
            }
        }

        return false;
    };

    const updateUserInDb = async (updatedUser: User) => {
        try {
            const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
            let usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

            const index = usersDb.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
                usersDb[index] = updatedUser;
            } else {
                usersDb.push(updatedUser);
            }

            await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
        } catch (error) {
            console.error("Error updating user in DB:", error);
        }
    };

    const setDisplayName = async (name: string) => {
        if (user) {
            const updatedUser = { ...user, displayName: name };
            setUser(updatedUser);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            await updateUserInDb(updatedUser);
        }
    };

    const setRole = async (role: UserRole) => {
        if (user) {
            let updatedUser: User;

            if (role === 'rider') {
                updatedUser = {
                    ...user,
                    role: 'rider',
                    vehicleType: 'motorcycle', // Default
                    plateNumber: '',
                    idCardNumber: '',
                    licenseNumber: '',
                    verificationStatus: 'approved'
                } as RiderProfile;
            } else if (role === 'merchant') {
                updatedUser = {
                    ...user,
                    role: 'merchant',
                    isOpen: true, // Default open
                    ownerName: '',
                } as MerchantProfile;
            } else if (role === 'admin') {
                updatedUser = {
                    ...user,
                    role: 'admin'
                } as AdminProfile;
            } else {
                updatedUser = {
                    ...user,
                    role: 'buyer'
                } as BuyerProfile;
            }

            setUser(updatedUser);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            await updateUserInDb(updatedUser);
        }
    };

    const updateProfile = async (partial: any) => {
        if (user) {
            // Prevent cross-role name updates
            if (user.role === 'buyer') {
                delete partial.riderName;
                delete partial.merchantName;
            } else if (user.role === 'rider') {
                delete partial.buyerName;
                delete partial.merchantName;
            } else if (user.role === 'merchant') {
                delete partial.buyerName;
                delete partial.riderName;
            }

            const updatedUser = { ...user, ...partial } as User;
            console.log("Saving user profile:", partial);
            setUser(updatedUser);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            await updateUserInDb(updatedUser);
        }
    };

    const updateUser = async (updatedUser: User) => {
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

        // Update in "database"
        try {
            const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
            let usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

            const index = usersDb.findIndex(u => u.phone === updatedUser.phone);
            if (index !== -1) {
                usersDb[index] = updatedUser;
            } else {
                usersDb.push(updatedUser);
            }

            await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
        } catch (error) {
            console.error("Error updating user in DB:", error);
        }
    };

    const addAddress = async (addressData: Omit<Address, "id">) => {
        if (!user) return;
        const newAddress: Address = {
            id: Date.now().toString(),
            ...addressData,
        };
        const currentAddresses = user.addresses || [];
        // If it's the first address, make it default
        if (currentAddresses.length === 0) {
            newAddress.isDefault = true;
        }

        const updatedAddresses = [...currentAddresses, newAddress];
        const updatedUser = {
            ...user,
            addresses: updatedAddresses,
            // Sync legacy addressLine if default
            addressLine: newAddress.isDefault ? newAddress.fullAddress : user.addressLine
        };

        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        await updateUserInDb(updatedUser);
    };

    const removeAddress = async (id: string) => {
        if (!user || !user.addresses) return;
        const updatedAddresses = user.addresses.filter(a => a.id !== id);
        const updatedUser = { ...user, addresses: updatedAddresses };
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        await updateUserInDb(updatedUser);
    };

    const setDefaultAddress = async (id: string) => {
        if (!user || !user.addresses) return;
        const updatedAddresses = user.addresses.map(a => ({
            ...a,
            isDefault: a.id === id
        }));
        const defaultAddr = updatedAddresses.find(a => a.isDefault);

        const updatedUser = {
            ...user,
            addresses: updatedAddresses,
            addressLine: defaultAddr ? defaultAddr.fullAddress : user.addressLine
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        await updateUserInDb(updatedUser);
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithPhone,
            verifyOtp,
            setDisplayName,
            setRole,
            updateProfile,
            updateUser,
            addAddress,
            removeAddress,
            setDefaultAddress,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
