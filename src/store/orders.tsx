import React, { createContext, useState, useContext, ReactNode } from 'react';
import { OrderStatus } from '../utils/orderStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OrderItem = {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
};

export type Order = {
    id: string;

    // --- Customer Info ---
    customerId: string;
    customerName: string;
    customerPhone?: string;
    customerAddress: string;
    customerLocation: { lat: number; lng: number };
    buyerNote?: string;

    // --- Store Info ---
    storeId: string;
    storeName: string;
    storePhone?: string;
    storeAddress?: string;
    storeLocation?: { lat: number; lng: number };

    // --- Rider Info ---
    riderId?: string;
    riderName?: string;
    riderPhone?: string;
    riderLocation?: { lat: number; lng: number }; // Legacy
    riderLiveLocation?: { lat: number; lng: number; updatedAt: number }; // New standard

    items: OrderItem[];

    // --- Backward compatibility fields ---
    buyerId: string;
    buyerName: string;
    buyerAddress: string;
    buyerLocation: { lat: number; lng: number };
    buyerPhone?: string;
    productId: string;
    quantity: number;
    productPrice: number;

    // --- Payment & Fees ---
    itemsTotal: number;
    deliveryFee: number;
    platformFee?: number;
    discountCode?: string;
    discountAmount?: number;
    grandTotal: number;
    total: number; // Alias for grandTotal as requested

    paymentMethod: "PREPAID" | "COD";
    riderNetEarning?: number;
    codAmount?: number;
    isStorePaid?: boolean;
    isRiderPaid?: boolean;

    // --- Status & Timestamps ---
    status: OrderStatus;
    createdAt: string; // Keep as string for compatibility, or add number alias?
    // User requested number for timestamps
    confirmedAt?: number;
    assignedAt?: number;
    pickedUpAt?: number;
    deliveredAt?: number;

    // Legacy string timestamps
    storeConfirmedAt?: string;
    riderAssignedAt?: string;
    riderHeadingAt?: string;
    // pickedUpAt?: string; // Conflict with number? No, TS allows union if I define it carefully or rename.
    // Actually, user requested pickedUpAt?: number. Existing was string.
    // I will use number for the new fields and keep the old ones with different names if needed, or just change type to number | string?
    // Changing to number | string is safest.

    riderArrivedAt?: string;
    // deliveredAt?: string; // Conflict
    completedAt?: string;
    cancelledAt?: string;

    // --- Ratings ---
    ratingStars?: number;
    ratingComment?: string;
    complaint?: string;
    ratedAt?: number;

    riderRating?: number;
    riderReviewText?: string;
    storeRating?: number;
    storeReviewText?: string;
    reviewFromBuyer?: { rating: number; comment: string };
    reviewFromRider?: { rating: number; comment: string };
    buyerReview?: BuyerReview | null;
};

export type BuyerReview = {
    rating: number;
    comment: string;
    createdAt: string;
};

export type RiderReview = {
    rating: number;
    comment?: string;
    date: string | number;
    customerName: string;
};

export type OrdersStore = {
    orders: Order[];

    // Legacy support
    addOrder: (order: any) => void;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    acceptOrder: (id: string, riderName: string) => void;
    addOrderRating: (id: string, ratingStars: number, ratingComment?: string, complaint?: string) => void;

    // New Comprehensive Actions
    createOrder: (orderData: any) => Order;
    storeConfirmOrder: (orderId: string) => void;
    confirmOrder: (orderId: string) => void;
    setWaitingRider: (orderId: string) => void;
    assignRider: (orderId: string, rider: { id: string; name: string; phone: string }) => void;
    riderHeadingToStore: (orderId: string) => void;
    riderPickedUp: (orderId: string) => void;
    riderArrived: (orderId: string) => void;
    markDeliveredWaitingPayment: (orderId: string) => void;
    completeOrder: (orderId: string) => void;
    cancelOrder: (orderId: string) => void;
    updateRiderLocation: (orderId: string, loc: { lat: number; lng: number; updatedAt: number }) => void;
    rateRider: (orderId: string, rating: number, review: string) => void;
    confirmPickup: (orderId: string) => void;
    confirmDelivery: (orderId: string) => void;
    confirmDelivered: (orderId: string, review: { rating: number; comment: string }) => void;
    addBuyerReview: (orderId: string, review: BuyerReview) => void;

    // Legacy Aliases
    riderPickup: (orderId: string) => void;
    riderDelivered: (orderId: string) => void;

    // Getters
    getOrdersByProduct: (productId: string) => Order[];
    getOrdersByBuyer: (buyerName: string) => Order[];
    getAvailableForRider: () => Order[];
    getOrdersByRider: (riderName: string) => Order[];
    getOrderById: (id: string) => Order | undefined;
    getReviewsByRider: (riderId: string) => RiderReview[];
};

const OrdersContext = createContext<OrdersStore | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    React.useEffect(() => {
        const clearDemoData = async () => {
            try {
                await AsyncStorage.removeItem("orders");
                // Also clear any other potential keys if we used them
                await AsyncStorage.removeItem("nadHub:orders");
            } catch (error) {
                console.log("Error clearing demo orders:", error);
            }
        };
        clearDemoData();
    }, []);

    // --- Actions Implementation ---

    const createOrder = (orderData: any): Order => {
        const firstItem = orderData.items?.[0];
        const now = new Date().toISOString();

        const newOrder: Order = {
            ...orderData,
            id: Date.now().toString(),
            createdAt: now,
            status: 'pending', // New status

            // Defaults
            storeId: orderData.storeId || 'store1',
            storeName: orderData.storeName || 'ร้านค้า NadHub',
            paymentMethod: orderData.paymentMethod || 'COD',

            // Mappings
            buyerId: orderData.buyerId || orderData.customerId,
            buyerName: orderData.buyerName || orderData.customerName,
            buyerAddress: orderData.buyerAddress || orderData.customerAddress,
            buyerLocation: orderData.buyerLocation || orderData.customerLocation,

            customerId: orderData.customerId || orderData.buyerId,
            customerName: orderData.customerName || orderData.buyerName,
            customerAddress: orderData.customerAddress || orderData.buyerAddress,
            customerLocation: orderData.customerLocation || orderData.buyerLocation,

            // Legacy
            productId: firstItem ? firstItem.productId : '',
            quantity: orderData.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
            productPrice: firstItem ? firstItem.price : 0,
            itemsTotal: orderData.itemsTotal || 0,
            deliveryFee: orderData.deliveryFee || 0,
            grandTotal: orderData.grandTotal || 0,
            total: orderData.grandTotal || 0,
            items: orderData.items || []
        };

        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
    };

    // Legacy wrapper
    const addOrder = (orderData: any) => {
        createOrder(orderData);
    };

    const updateOrderStatus = (id: string, status: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    const confirmOrder = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'confirmed',
            confirmedAt: Date.now(),
            storeConfirmedAt: new Date().toISOString() // Keep legacy sync
        } : o));
    };

    const storeConfirmOrder = confirmOrder; // Alias new to old

    const setWaitingRider = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'WAITING_RIDER' // Keep legacy flow for now or update? User didn't specify 'waiting_rider'
        } : o));
    };

    const assignRider = (id: string, rider: { id: string; name: string; phone: string }) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'assigned',
            riderId: rider.id,
            riderName: rider.name,
            riderPhone: rider.phone,
            assignedAt: Date.now(),
            riderAssignedAt: new Date().toISOString()
        } : o));
    };

    // Legacy wrapper
    const acceptOrder = (id: string, riderName: string) => {
        assignRider(id, { id: 'rider_legacy', name: riderName, phone: '' });
    };

    const riderHeadingToStore = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'RIDER_HEADING_TO_STORE',
            riderHeadingAt: new Date().toISOString()
        } : o));
    };

    const riderPickedUp = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'picked_up',
            pickedUpAt: Date.now(),
        } : o));
    };

    const riderArrived = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'RIDER_ARRIVED',
            riderArrivedAt: new Date().toISOString()
        } : o));
    };

    const markDeliveredWaitingPayment = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'delivered',
            deliveredAt: Date.now(),
        } : o));
    };

    const confirmPickup = riderPickedUp;

    const confirmDelivery = markDeliveredWaitingPayment;

    const completeOrder = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'COMPLETED',
            completedAt: new Date().toISOString()
        } : o));
    };

    const cancelOrder = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'CANCELLED',
            cancelledAt: new Date().toISOString()
        } : o));
    };

    const updateRiderLocation = (id: string, loc: { lat: number; lng: number; updatedAt: number }) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            riderLiveLocation: loc,
            riderLocation: { lat: loc.lat, lng: loc.lng } // Sync legacy
        } : o));
    };

    const rateRider = (id: string, rating: number, review: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            riderRating: rating,
            riderReviewText: review
        } : o));
    };

    const confirmDelivered = (id: string, review: { rating: number; comment: string }) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            reviewFromRider: review,
        } : o));
    };

    const addBuyerReview = (orderId: string, review: BuyerReview) => {
        setOrders(prev => prev.map(o => o.id === orderId ? {
            ...o,
            buyerReview: review
        } : o));
    };

    const addOrderRating = (id: string, ratingStars: number, ratingComment?: string, complaint?: string) => {
        setOrders(prev => prev.map(o => o.id === id ? {
            ...o,
            ratingStars,
            ratingComment,
            complaint,
            ratedAt: Date.now()
        } : o));
    };

    // --- Getters ---

    const getOrdersByProduct = (productId: string) => {
        return orders.filter((order) => order.items.some(item => item.productId === productId));
    };

    const getOrdersByBuyer = (buyerName: string) => {
        return orders.filter((order) => order.buyerName === buyerName);
    };

    const getAvailableForRider = () => {
        return orders.filter((order) => (order.status === 'WAITING_RIDER' || order.status === 'confirmed') && !order.riderName);
    };

    const getOrdersByRider = (riderName: string) => {
        return orders.filter((order) => order.riderName === riderName);
    };

    const getOrderById = (id: string) => {
        return orders.find((order) => order.id === id);
    };

    const getReviewsByRider = (riderId: string): RiderReview[] => {
        return orders
            .filter(o => o.riderId === riderId && o.riderRating)
            .map(o => ({
                rating: o.riderRating!,
                comment: o.riderReviewText,
                date: o.completedAt || o.deliveredAt || new Date().toISOString(),
                customerName: o.buyerName,
            }));
    };

    return (
        <OrdersContext.Provider value={{
            orders,
            addOrder,
            updateOrderStatus,
            confirmOrder,
            assignRider,
            acceptOrder,
            riderPickup: riderPickedUp, // Alias for backward compat
            riderDelivered: markDeliveredWaitingPayment, // Alias for backward compat
            confirmPickup,
            confirmDelivery,
            completeOrder,
            updateRiderLocation,
            addOrderRating,
            getOrdersByProduct,
            getOrdersByBuyer,
            getAvailableForRider,
            getOrdersByRider,
            getOrderById,
            getReviewsByRider,

            // New exports
            createOrder,
            storeConfirmOrder,
            setWaitingRider,
            riderHeadingToStore,
            riderPickedUp,
            riderArrived,
            markDeliveredWaitingPayment,
            cancelOrder,
            rateRider,
            confirmDelivered,
            addBuyerReview
        }}>
            {children}
        </OrdersContext.Provider>
    );
};

export const useOrders = (): OrdersStore => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrdersProvider');
    }
    return context;
};
