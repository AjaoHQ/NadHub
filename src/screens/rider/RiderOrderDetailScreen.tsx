import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RiderStackParamList } from '../../types';
import { useOrders } from '../../store/orders';
import { useProducts } from '../../store/products';
import { Ionicons } from '@expo/vector-icons';
import { getOrderStatusLabel, getOrderStatusColor, OrderStatus } from '../../utils/orderStatus';

type RiderOrderDetailRouteProp = RouteProp<RiderStackParamList, 'RiderOrderDetail'>;
type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RiderOrderDetail'>;

const CURRENT_RIDER = "Demo Rider";

export default function RiderOrderDetailScreen() {
    const route = useRoute<RiderOrderDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { orderId } = route.params;
    const {
        orders,
        assignRider,
        confirmPickup,
        confirmDelivery,
        completeOrder,
        updateRiderLocation
    } = useOrders();
    const { products } = useProducts();

    const order = orders.find(o => o.id === orderId);
    const product = order ? products.find(p => p.id === order.productId) : null;

    // Simulate location updates when active
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (order && order.riderName === CURRENT_RIDER &&
            ['assigned', 'picked_up', 'delivered', 'RIDER_HEADING_TO_STORE', 'PICKED_UP', 'DELIVERED_WAITING_PAYMENT', 'RIDER_ARRIVED'].includes(order.status)) {

            interval = setInterval(() => {
                // Simulate moving rider slightly
                const currentLat = order.riderLocation?.lat || 13.7563;
                const currentLng = order.riderLocation?.lng || 100.5018;
                const newLat = currentLat + (Math.random() - 0.5) * 0.001;
                const newLng = currentLng + (Math.random() - 0.5) * 0.001;

                updateRiderLocation(order.id, {
                    lat: newLat,
                    lng: newLng,
                    updatedAt: Date.now()
                });
            }, 3000); // Update every 3 seconds
        }
        return () => clearInterval(interval);
    }, [order?.status, order?.id]);


    if (!order || !product) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>ไม่พบข้อมูลคำสั่งซื้อ</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>ย้อนกลับ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleAcceptJob = () => {
        Alert.alert(
            "ยืนยันรับงาน",
            "คุณต้องการรับงานนี้ใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยัน",
                    onPress: () => {
                        assignRider(order.id, {
                            id: 'rider_demo_id',
                            name: CURRENT_RIDER,
                            phone: '0899999999'
                        });
                        Alert.alert("สำเร็จ", "คุณได้รับงานแล้ว กำลังเดินทางไปร้านค้า");
                    }
                }
            ]
        );
    };

    const handlePickup = () => {
        Alert.alert(
            "ยืนยันรับสินค้า",
            "คุณได้รับสินค้าจากร้านค้าแล้วใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยัน",
                    onPress: () => {
                        confirmPickup(order.id);
                        Alert.alert("สำเร็จ", "รับสินค้าแล้ว กำลังไปส่งลูกค้า");
                    }
                }
            ]
        );
    };

    const handleDelivered = () => {
        Alert.alert(
            "ยืนยันส่งสินค้า",
            "คุณส่งสินค้าถึงมือลูกค้าแล้วใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยัน",
                    onPress: () => {
                        confirmDelivery(order.id);
                        Alert.alert("สำเร็จ", "ส่งสินค้าแล้ว รอการชำระเงิน/ยืนยัน");
                    }
                }
            ]
        );
    };

    const handleCompleteJob = () => {
        Alert.alert(
            "ยืนยันปิดงาน",
            "เคลียร์เงินกับร้าน/ลูกค้าเรียบร้อยแล้วหรือยัง?",
            [
                { text: "ยังไม่เรียบร้อย", style: "cancel" },
                {
                    text: "เรียบร้อย/ปิดงาน",
                    onPress: () => {
                        completeOrder(order.id);
                        Alert.alert("สำเร็จ", "ปิดงานเรียบร้อยแล้ว");
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const isMyJob = order.riderName === CURRENT_RIDER;
    const statusLabel = getOrderStatusLabel(order.status as OrderStatus);
    const statusColor = getOrderStatusColor(order.status as OrderStatus);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.sectionTitle}>รายละเอียดงาน</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
                </View>

                <Text style={styles.productName}>{product.name}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>ร้านค้า</Text>
                    <Text style={styles.value}>{order.storeName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>ผู้สั่งซื้อ</Text>
                    <Text style={styles.value}>{order.customerName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>เบอร์โทร</Text>
                    <Text style={styles.value}>{order.customerPhone || '08x-xxx-xxxx'}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>จุดรับสินค้า</Text>
                    <Text style={styles.value}>{order.storeAddress || 'ร้านค้า NadHub'}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>จุดส่งสินค้า</Text>
                    <Text style={styles.value}>{order.customerAddress}</Text>
                </View>
                {order.buyerNote && (
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>หมายเหตุจากลูกค้า</Text>
                        <Text style={styles.note}>{order.buyerNote}</Text>
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.label}>ค่าจัดส่งที่จะได้รับ</Text>
                    <Text style={styles.fee}>{order.deliveryFee} บาท</Text>
                </View>
            </View>

            {/* Map Placeholder */}
            {isMyJob && ['assigned', 'picked_up', 'delivered', 'RIDER_HEADING_TO_STORE', 'PICKED_UP', 'DELIVERED_WAITING_PAYMENT', 'RIDER_ARRIVED'].includes(order.status) && (
                <View style={styles.mapContainer}>
                    <Text style={styles.mapText}>[ แผนที่จำลอง ]</Text>
                    <Text style={styles.mapSubText}>
                        Rider Location: {order.riderLiveLocation?.lat.toFixed(4) || order.riderLocation?.lat.toFixed(4) || 0},
                        {order.riderLiveLocation?.lng.toFixed(4) || order.riderLocation?.lng.toFixed(4) || 0}
                    </Text>
                </View>
            )}

            {/* Rider Rating Review Section - Only show if job is completed and rated */}
            {order.status === 'COMPLETED' && order.riderRating && (
                <View style={styles.reviewContainer}>
                    <Text style={styles.reviewTitle}>รีวิวจากลูกค้า</Text>
                    <View style={styles.ratingRow}>
                        <View style={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= (order.riderRating || 0) ? "star" : "star-outline"}
                                    size={24}
                                    color="#FFD700"
                                />
                            ))}
                        </View>
                        <Text style={styles.ratingValue}>{order.riderRating.toFixed(1)}</Text>
                    </View>
                    {order.riderReviewText && (
                        <View style={styles.commentBox}>
                            <Text style={styles.commentText}>"{order.riderReviewText}"</Text>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.actionContainer}>
                {(order.status === 'WAITING_RIDER' || order.status === 'confirmed') && !order.riderName && (
                    <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptJob}>
                        <Text style={styles.acceptButtonText}>รับงานนี้</Text>
                    </TouchableOpacity>
                )}

                {isMyJob && (order.status === 'assigned' || order.status === 'RIDER_HEADING_TO_STORE') && (
                    <TouchableOpacity style={styles.actionButton} onPress={handlePickup}>
                        <Text style={styles.actionButtonText}>ยืนยันรับของแล้ว</Text>
                    </TouchableOpacity>
                )}

                {isMyJob && (order.status === 'picked_up' || order.status === 'PICKED_UP' || order.status === 'RIDER_ARRIVED') && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleDelivered}>
                        <Text style={styles.actionButtonText}>ยืนยันส่งของแล้ว</Text>
                    </TouchableOpacity>
                )}

                {isMyJob && (order.status === 'delivered' || order.status === 'DELIVERED_WAITING_PAYMENT') && (
                    <TouchableOpacity style={styles.completeButton} onPress={handleCompleteJob}>
                        <Text style={styles.completeButtonText}>ปิดงาน</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608', // Dark background for Rider app
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000608',
    },
    errorText: {
        fontSize: 18,
        marginBottom: 20,
        color: '#FF5C5C',
    },
    backButton: {
        padding: 10,
        backgroundColor: '#263B3B',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
    },
    card: {
        backgroundColor: '#02090A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1E3C33',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8FA3A3',
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#8FA3A3',
    },
    value: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    infoBlock: {
        marginBottom: 12,
    },
    note: {
        fontSize: 14,
        color: '#FFFFFF',
        fontStyle: 'italic',
        backgroundColor: '#0F1A1A',
        padding: 8,
        borderRadius: 4,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#001010',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#1E3C33',
        marginVertical: 12,
    },
    fee: {
        fontSize: 18,
        color: '#36D873',
        fontWeight: 'bold',
    },
    mapContainer: {
        backgroundColor: '#0F1A1A',
        height: 150,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    mapText: {
        color: '#6A7A7A',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapSubText: {
        color: '#36D873',
        fontSize: 12,
        marginTop: 8,
    },
    actionContainer: {
        marginTop: 16,
        marginBottom: 40,
    },
    acceptButton: {
        backgroundColor: '#36D873',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#001010',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionButton: {
        backgroundColor: '#36D873',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        color: '#001010',
        fontSize: 18,
        fontWeight: 'bold',
    },
    completeButton: {
        backgroundColor: '#1ECC88',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#001010',
        fontSize: 18,
        fontWeight: 'bold',
    },
    reviewContainer: {
        backgroundColor: '#0F1A1A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8FA3A3',
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    commentBox: {
        backgroundColor: '#02090A',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    commentText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontStyle: 'italic',
    },
});
