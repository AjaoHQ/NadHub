export const calculateDeliveryFee = (distanceKm: number): number => {
    if (distanceKm <= 3) return 20;
    if (distanceKm <= 8) return 30;
    if (distanceKm <= 15) return 40;
    return 50; // Fallback for > 15km
};
