import React, { createContext, useState, useContext, ReactNode } from 'react';

export type CartItem = {
    id: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    merchantId: string;
};

export type CartStore = {
    cartItems: CartItem[];
    addToCart: (product: { id: string; name: string; price: number; imageUrl?: string; merchantId: string }, quantity?: number) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    itemsTotal: number;
};

const CartContext = createContext<CartStore | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (product: { id: string; name: string; price: number; imageUrl?: string; merchantId: string }, quantity: number = 1) => {
        setCartItems((prev) => {
            const existingItem = prev.find((item) => item.productId === product.id);
            if (existingItem) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        productId: product.id,
                        productName: product.name,
                        price: product.price,
                        quantity,
                        imageUrl: product.imageUrl,
                        merchantId: product.merchantId,
                    },
                ];
            }
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }
        setCartItems((prev) =>
            prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const contextValue: CartStore = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemsTotal,
    };

    return React.createElement(
        CartContext.Provider,
        { value: contextValue },
        children
    );
};

export const useCart = (): CartStore => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
