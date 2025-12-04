export type DiscountType = 'percent' | 'flat';

export type DiscountCode = {
    code: string;
    type: DiscountType;
    value: number;
    minOrderTotal?: number;
    isActive: boolean;
};

export const AVAILABLE_DISCOUNTS: DiscountCode[] = [
    {
        code: 'WELCOME20',
        type: 'percent',
        value: 20,
        minOrderTotal: 100,
        isActive: true,
    },
    {
        code: 'NADHUB30',
        type: 'flat',
        value: 30,
        minOrderTotal: 150,
        isActive: true,
    },
    {
        code: 'FREESHIP',
        type: 'flat',
        value: 0, // Special case: value will be equal to delivery fee
        minOrderTotal: 80,
        isActive: true,
    },
];

export const calculateDiscount = (
    code: string,
    itemsTotal: number,
    deliveryFee: number
): { discountAmount: number; discountCode: string } | null => {
    const discount = AVAILABLE_DISCOUNTS.find(
        (d) => d.code.toLowerCase() === code.toLowerCase() && d.isActive
    );

    if (!discount) {
        return null;
    }

    if (discount.minOrderTotal && itemsTotal < discount.minOrderTotal) {
        return null; // Requirement not met
    }

    let discountAmount = 0;

    if (discount.code === 'FREESHIP') {
        discountAmount = deliveryFee;
    } else if (discount.type === 'percent') {
        discountAmount = itemsTotal * (discount.value / 100);
    } else if (discount.type === 'flat') {
        discountAmount = discount.value;
    }

    // Ensure discount doesn't exceed total (though grandTotal calculation handles negative check usually, good to cap here too)
    // But grandTotal = itemsTotal + deliveryFee - discountAmount.
    // If discount is huge, grandTotal could be negative.
    // Let's return the calculated amount, and let the caller cap grandTotal at 0.

    return {
        discountAmount,
        discountCode: discount.code, // Return canonical case
    };
};
