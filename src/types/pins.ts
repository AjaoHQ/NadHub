export type PinLocation = {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    addressText?: string;
    note?: string;
    updatedAt?: number;
    updatedBy?: "merchant" | "customer" | "admin";
};

// Helper to normalize to guaranteed { latitude, longitude }
export function normalizePinLocation(pin: PinLocation): { latitude: number; longitude: number } {
    const lat = pin.latitude ?? pin.lat ?? 0;
    const lng = pin.longitude ?? pin.lng ?? 0;
    return { latitude: lat, longitude: lng };
}
