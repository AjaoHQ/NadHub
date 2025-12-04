import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useCart } from '../../store/cart_store';
import { useOrders } from '../../store/orders';
import { useAuth } from '../../store/auth';
import { calculateDeliveryFee } from '../../utils/shipping';
import { calculateDiscount } from '../../store/discounts';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function BuyerCartScreen() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, itemsTotal } = useCart();
    const { createOrder } = useOrders();
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);

    // Mock distance for delivery fee
    const distanceKm = 5;
    const deliveryFee = calculateDeliveryFee(distanceKm);

    // Recalculate discount when itemsTotal changes if percentage
    useEffect(() => {
        if (appliedDiscount) {
            const result = calculateDiscount(appliedDiscount.code, itemsTotal, deliveryFee);
            if (result) {
                setAppliedDiscount({ code: result.discountCode, amount: result.discountAmount });
            } else {
                setAppliedDiscount(null); // Invalidated (e.g. total dropped below min)
            }
        }
    }, [itemsTotal, deliveryFee, appliedDiscount?.code]);

    const grandTotal = Math.max(0, itemsTotal + deliveryFee - (appliedDiscount?.amount || 0));

    const handleConfirmOrder = () => {
        if (cartItems.length === 0) return;
        if (!user) {
            Alert.alert('กรุณาเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อนสั่งซื้อ');
            return;
        }

        // Mock Store Info (In real app, this comes from the selected items' store or context)
        const mockStore = {
            storeId: 'store1',
            storeName: 'ร้านค้า NadHub',
            storePhone: '02-999-9999',
            storeAddress: '123 ตลาดนัดฮับ',
            storeLocation: { lat: 13.7563, lng: 100.5018 }
        };

        createOrder({
            // Customer Info
            customerId: user.id,
            customerName: user.displayName || user.phone || 'Guest',
            customerPhone: user.phone,
            customerAddress: user.addressLine || "ที่อยู่จัดส่ง (Mock)",
            customerLocation: { lat: 13.7563, lng: 100.5018 }, // Mock location

            // Store Info
            ...mockStore,

            // Order Items
            items: cartItems.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
            })),

            // Payment & Fees
            itemsTotal,
            deliveryFee,
            platformFee: 0, // Mock
            riderNetEarning: deliveryFee * 0.8, // Mock formula
            grandTotal,
            discountCode: appliedDiscount?.code,
            discountAmount: appliedDiscount?.amount,
            paymentMethod: 'COD', // Default for now
        });

        clearCart();
        Alert.alert('สำเร็จ', 'สั่งซื้อสินค้าเรียบร้อยแล้ว');
        navigation.navigate('BuyerTabs', { screen: 'BuyerOrders' } as never);
    };

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>ตะกร้าของคุณยังว่างอยู่</Text>
                <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('BuyerHome')}>
                    <Text style={styles.shopButtonText}>ไปเลือกสินค้า</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                            <Text style={styles.itemPrice}>{item.price} บาท</Text>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={styles.qtyButton}
                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Ionicons name="remove" size={16} color="#333" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity
                                    style={styles.qtyButton}
                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Ionicons name="add" size={16} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.itemRight}>
                            <Text style={styles.itemSubtotal}>{item.price * item.quantity} บ.</Text>
                            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>รวมค่าสินค้า</Text>
                    <Text style={styles.summaryValue}>{itemsTotal} บาท</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>ค่าจัดส่ง</Text>
                    <Text style={styles.summaryValue}>{deliveryFee} บาท</Text>
                </View>
                {appliedDiscount && (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, styles.discountText]}>ส่วนลด ({appliedDiscount.code})</Text>
                        <Text style={[styles.summaryValue, styles.discountText]}>-{appliedDiscount.amount} บาท</Text>
                    </View>
                )}
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>รวมทั้งหมด</Text>
                    <Text style={styles.totalValue}>{grandTotal} บาท</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearCart}>
                        <Text style={styles.clearButtonText}>ล้างตะกร้า</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirmOrder}>
                        <Text style={styles.confirmButtonText}>ยืนยันคำสั่งซื้อ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContent: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 4,
        backgroundColor: '#eee',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    qtyButton: {
        padding: 4,
        width: 28,
        alignItems: 'center',
    },
    qtyText: {
        paddingHorizontal: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    itemRight: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 60,
        marginLeft: 8,
    },
    itemSubtotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF9500',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#333',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
    },
    discountText: {
        color: '#34C759',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF9500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    clearButtonText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#FF9500',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
