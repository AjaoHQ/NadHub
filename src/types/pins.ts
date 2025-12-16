export type PinLocation = {
    lat: number;
    lng: number;
    address?: string; // Optional text address
    note?: string; // Optional driver note
    updatedAt?: number;
};

export type ShopPinConfig = {
    shopId: string;
    pin: PinLocation;
};
