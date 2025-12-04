import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductCategoryId } from '../constants/categories';

const PRODUCTS_STORAGE_KEY = "nad_products_db_v1";

export type Product = {
    id: string;
    name: string;
    price: number;
    categoryId: ProductCategoryId;
    promotion?: string;
    imageUris: string[];
    videoUri?: string;
    merchantId: string;
    merchantName?: string;
};

export type ProductStore = {
    products: Product[];
    isLoading: boolean;
    error: Error | null;
    addProduct: (data: Omit<Product, "id">) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    refreshProducts: () => Promise<void>;
};

const ProductsContext = createContext<ProductStore | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'ข้าวมันไก่',
        price: 50,
        categoryId: 'ready_food',
        imageUris: ['https://via.placeholder.com/100'],
        merchantId: 'merchant_1',
        merchantName: 'ร้านข้าวมันไก่เจ๊แดง',
    },
    {
        id: '2',
        name: 'ก๋วยเตี๋ยวเรือ',
        price: 45,
        categoryId: 'ready_food',
        imageUris: ['https://via.placeholder.com/100'],
        merchantId: 'merchant_1',
        merchantName: 'ร้านข้าวมันไก่เจ๊แดง',
    },
    {
        id: '3',
        name: 'ชานมไข่มุก',
        price: 30,
        categoryId: 'drink',
        imageUris: ['https://via.placeholder.com/100'],
        merchantId: 'merchant_2',
        merchantName: 'Bubble Tea Shop',
    },
];

async function loadProductsFromStorage(): Promise<Product[]> {
    try {
        const raw = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Product[];
    } catch (e) {
        console.warn("[products] Failed to load from storage", e);
        return [];
    }
}

async function saveProductsToStorage(products: Product[]) {
    try {
        await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
        console.warn("[products] Failed to save to storage", e);
    }
}

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Initial load
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const stored = await loadProductsFromStorage();
                let loadedProducts = stored;

                // Seed if empty
                if (!stored || stored.length === 0) {
                    loadedProducts = INITIAL_PRODUCTS;
                    await saveProductsToStorage(loadedProducts);
                }

                if (!cancelled) {
                    setProducts(loadedProducts);
                    setIsLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error('Failed to load products'));
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const refreshProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const stored = await loadProductsFromStorage();
            setProducts(stored);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch products'));
        } finally {
            setIsLoading(false);
        }
    };

    const addProduct = (data: Omit<Product, "id">) => {
        setProducts((prev) => {
            const newProduct: Product = {
                ...data,
                id: Date.now().toString(),
            };
            const newProducts = [...prev, newProduct];
            saveProductsToStorage(newProducts);
            return newProducts;
        });
    };

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts((prev) => {
            const newProducts = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
            saveProductsToStorage(newProducts);
            return newProducts;
        });
    };

    const deleteProduct = (id: string) => {
        setProducts((prev) => {
            const newProducts = prev.filter((p) => p.id !== id);
            saveProductsToStorage(newProducts);
            return newProducts;
        });
    };

    return (
        <ProductsContext.Provider value={{
            products,
            isLoading,
            error,
            addProduct,
            updateProduct,
            deleteProduct,
            refreshProducts
        }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = (): ProductStore => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
};
