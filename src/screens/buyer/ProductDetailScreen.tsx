
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, StyleSheet, Dimensions, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BuyerStackParamList } from '../../types';
import { useProducts } from '../../store/products';
import { useOrders } from '../../store/orders';
import { useAuth } from '../../store/auth';
import { useCart } from '../../store/cart_store';
import { calculateDeliveryFee } from '../../utils/shipping';
import { calculateDiscount } from '../../store/discounts';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

type Props = NativeStackScreenProps<BuyerStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ route, navigation }: Props) {
    const { productId } = route.params;
    const { products } = useProducts();
    const { addOrder } = useOrders();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const product = products.find(p => p.id === productId);

    const [buyerAddress, setBuyerAddress] = useState('');
    const [buyerNote, setBuyerNote] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);

    // Mock distance for this session (in a real app, this would come from location service)
    const [distanceKm] = useState(() => Math.floor(Math.random() * 10) + 1);
    const deliveryFee = calculateDeliveryFee(distanceKm);

    // Assume store is open for now, or fetch real status if needed later
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    if (!product) {
        return (
            <View style={styles.centered}>
                <Text>ไม่พบสินค้า</Text>
            </View>
        );
    }

    const qty = Number(quantity) || 1;
    const itemsTotal = qty * product.price;

    const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
    const grandTotal = Math.max(0, itemsTotal + deliveryFee - discountAmount);

    const handleApplyDiscount = () => {
        if (!discountCodeInput.trim()) return;
        const result = calculateDiscount(discountCodeInput, itemsTotal, deliveryFee);
        if (result) {
            setAppliedDiscount({ code: discountCodeInput, amount: result.discountAmount });
            Alert.alert('สำเร็จ', 'ใช้โค้ดส่วนลดแล้ว');
        } else {
            Alert.alert('ไม่สำเร็จ', 'โค้ดส่วนลดไม่ถูกต้อง');
            setAppliedDiscount(null);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUris?.[0],
            merchantId: product.merchantId,
        }, qty);
        Alert.alert('สำเร็จ', 'เพิ่มสินค้าลงตะกร้าแล้ว');
    };

    const handleOrder = () => {
        if (!product) return;
        const orderItems = [{
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: qty,
            imageUrl: product.imageUris?.[0]
        }];

        addOrder({
            buyerId: user?.id || 'guest',
            buyerName: user?.displayName || 'Guest',
            items: orderItems,
            itemsTotal,
            deliveryFee,
            discountCode: appliedDiscount?.code,
            discountAmount: appliedDiscount?.amount,
            grandTotal,
            buyerAddress,
            buyerLocation: { lat: 0, lng: 0 }, // Mock location
            buyerNote,
        });
        Alert.alert('สำเร็จ', 'สั่งซื้อสินค้าเรียบร้อยแล้ว');
        navigation.navigate('BuyerTabs', { screen: 'BuyerOrders' } as never);
    };

    const imageUris = product.imageUris && product.imageUris.length > 0
        ? product.imageUris
        : ['https://via.placeholder.com/300'];

    const relatedProducts = products
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 4);

    const canOrder = isStoreOpen;

    return (
        <ScrollView style={styles.container}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
                {imageUris.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.image} />
                ))}
            </ScrollView>

            <View style={styles.infoContainer}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>{product.price} บาท</Text>
                <Text style={styles.category}>หมวดหมู่: {PRODUCT_CATEGORIES.find(c => c.id === product.categoryId)?.label || 'ทั่วไป'}</Text>
                <Text style={styles.merchantName}>ร้าน: {product.merchantName || 'Unknown Shop'}</Text>
                {product.promotion ? <Text style={styles.promotion}>{product.promotion}</Text> : null}

                {product.videoUri ? (
                    <View style={styles.videoBadge}>
                        <Text style={styles.videoText}>▶ มีวิดีโอแนะนำสินค้า</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>ข้อมูลการจัดส่ง</Text>

                {/* Buyer info is now taken from logged-in user */}
                <View style={styles.userInfoBlock}>
                    <Text style={styles.userInfoText}>ผู้สั่ง: {user?.displayName || user?.phone || 'Guest'}</Text>
                    <Text style={styles.userInfoText}>เบอร์โทร: {user?.phone || '-'}</Text>
                </View>

                <Text style={styles.label}>ที่อยู่จัดส่ง *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={buyerAddress}
                    onChangeText={setBuyerAddress}
                    placeholder="ระบุที่อยู่จัดส่งโดยละเอียด"
                    multiline
                    numberOfLines={3}
                />

                <Text style={styles.label}>จำนวน *</Text>
                <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={(text) => {
                        setQuantity(text);
                        // Reset discount when quantity changes to ensure validity
                        if (appliedDiscount) setAppliedDiscount(null);
                    }}
                    placeholder="1"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>โน้ตเพิ่มเติม (ถ้ามี)</Text>
                <TextInput
                    style={styles.input}
                    value={buyerNote}
                    onChangeText={setBuyerNote}
                    placeholder="เช่น ฝากไว้ที่ป้อมยาม"
                />

                <View style={styles.discountContainer}>
                    <Text style={styles.label}>โค้ดส่วนลด</Text>
                    <View style={styles.discountInputRow}>
                        <TextInput
                            style={[styles.input, styles.discountInput]}
                            value={discountCodeInput}
                            onChangeText={setDiscountCodeInput}
                            placeholder="กรอกโค้ดส่วนลด"
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity style={styles.applyButton} onPress={handleApplyDiscount}>
                            <Text style={styles.applyButtonText}>ใช้โค้ด</Text>
                        </TouchableOpacity>
                    </View>
                    {appliedDiscount && (
                        <Text style={styles.appliedDiscountText}>
                            ใช้โค้ด {appliedDiscount.code} แล้ว • ส่วนลด {appliedDiscount.amount} บาท
                        </Text>
                    )}
                </View>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text>ราคาสินค้า ({qty} ชิ้น)</Text>
                        <Text>{itemsTotal} บาท</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>ค่าจัดส่ง ({distanceKm} กม.)</Text>
                        <Text>{deliveryFee} บาท</Text>
                    </View>
                    {appliedDiscount && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.discountLabel}>ส่วนลด ({appliedDiscount.code})</Text>
                            <Text style={styles.discountValue}>-{appliedDiscount.amount} บาท</Text>
                        </View>
                    )}
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalText}>รวมทั้งหมด</Text>
                        <Text style={styles.totalText}>{grandTotal} บาท</Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {canOrder ? (
                        <>
                            <TouchableOpacity style={[styles.button, styles.addToCartButton]} onPress={handleAddToCart}>
                                <Text style={[styles.buttonText, styles.addToCartText]}>เพิ่มใส่ตะกร้า</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buyNowButton]}
                                onPress={handleOrder}
                            >
                                <Text style={styles.buttonText}>สั่งซื้อสินค้า</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            disabled={true}
                            style={[
                                styles.button,
                                styles.buyNowButton,
                                styles.orderButtonDisabled
                            ]}
                        >
                            <Text style={styles.buttonText}>
                                ร้านนี้ปิดชั่วคราว
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {relatedProducts.length > 0 && (
                <View style={styles.relatedContainer}>
                    <Text style={styles.relatedTitle}>สินค้าที่เกี่ยวข้อง</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {relatedProducts.map(rp => (
                            <TouchableOpacity
                                key={rp.id}
                                style={styles.relatedCard}
                                onPress={() => navigation.push('ProductDetail', { productId: rp.id })}
                            >
                                <Image
                                    source={{ uri: rp.imageUris?.[0] || 'https://via.placeholder.com/100' }}
                                    style={styles.relatedImage}
                                />
                                <Text style={styles.relatedName} numberOfLines={1}>{rp.name}</Text>
                                <Text style={styles.relatedPrice}>{rp.price} บาท</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carousel: {
        height: 300,
    },
    image: {
        width: Dimensions.get('window').width,
        height: 300,
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        color: '#FF9500',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    category: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    merchantName: {
        fontSize: 16,
        color: '#007AFF',
        marginBottom: 4,
        fontWeight: '600',
    },
    promotion: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: 'bold',
        marginTop: 4,
    },
    videoBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    videoText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    formContainer: {
        padding: 16,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    summaryContainer: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 8,
        marginTop: 4,
    },
    totalText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    addToCartButton: {
        backgroundColor: '#E5E5EA',
        borderWidth: 1,
        borderColor: '#D1D1D6',
    },
    addToCartText: {
        color: '#333',
    },
    buyNowButton: {
        backgroundColor: '#FF9500',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfoBlock: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#eef',
        borderRadius: 8,
    },
    userInfoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    discountContainer: {
        marginVertical: 12,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    discountInputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    discountInput: {
        flex: 1,
        marginBottom: 0, // Override default input margin
    },
    applyButton: {
        backgroundColor: '#5856D6',
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: 4,
        height: 40,
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    appliedDiscountText: {
        color: '#34C759',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '600',
    },
    discountLabel: {
        color: '#34C759',
    },
    discountValue: {
        color: '#34C759',
        fontWeight: 'bold',
    },
    relatedContainer: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
        marginBottom: 20,
    },
    relatedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    relatedCard: {
        width: 120,
        marginRight: 12,
    },
    relatedImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#eee',
    },
    relatedName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    relatedPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#34C759',
    },
    closedContainer: {
        flex: 1,
        backgroundColor: '#E5E5EA',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8E8E93',
        marginBottom: 4,
    },
    closedSubText: {
        fontSize: 14,
        color: '#8E8E93',
    },
    orderButtonDisabled: {
        backgroundColor: '#8E8E93',
        opacity: 0.5,
    },
});
