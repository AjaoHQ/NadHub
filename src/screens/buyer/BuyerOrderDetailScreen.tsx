import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BuyerStackParamList } from '../../types';
import { useOrders } from '../../store/orders';
import { Ionicons } from '@expo/vector-icons';
import { getOrderStatusLabel, getOrderStatusColor } from '../../utils/orderStatus';

type ScreenRouteProp = RouteProp<BuyerStackParamList, 'BuyerOrderDetail'>;

export default function BuyerOrderDetailScreen() {
    const route = useRoute<ScreenRouteProp>();
    const navigation = useNavigation();
    const { orderId } = route.params;
    const { getOrderById, rateRider } = useOrders();
    const order = getOrderById(orderId);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showRatingModal, setShowRatingModal] = useState(false);

    if (!order) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>ไม่พบคำสั่งซื้อ</Text>
            </View>
        );
    }

    const handleSubmitReview = () => {
        if (!comment.trim()) {
            Alert.alert("กรุณาใส่ความคิดเห็น", "ช่วยบอกเราหน่อยว่าบริการเป็นอย่างไรบ้าง");
            return;
        }
        rateRider(order.id, rating, comment);
        setShowRatingModal(false);
        Alert.alert("ขอบคุณ", "รีวิวของคุณถูกส่งเรียบร้อยแล้ว");
    };

    const statusLabel = getOrderStatusLabel(order.status);
    const statusColor = getOrderStatusColor(order.status);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('OrderTracking' as never, { orderId: order.id } as never)}>
                            <Text style={styles.trackLink}>ติดตามสถานะ {'>'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
                </View>

                {/* Status Section */}
                <View style={styles.statusSection}>
                    <Text style={styles.statusTitle}>สถานะปัจจุบัน:</Text>
                    <Text style={[styles.statusValue, { color: statusColor }]}>{statusLabel}</Text>
                    <Text style={styles.statusDesc}>
                        {order.status === 'PENDING_STORE_CONFIRM' && "รอร้านค้ายืนยันออเดอร์ของคุณ"}
                        {order.status === 'STORE_CONFIRMED' && "ร้านค้ารับออเดอร์แล้ว กำลังค้นหาไรเดอร์"}
                        {order.status === 'WAITING_RIDER' && "กำลังค้นหาไรเดอร์เพื่อไปรับสินค้า"}
                        {order.status === 'RIDER_HEADING_TO_STORE' && "ไรเดอร์รับงานแล้ว กำลังเดินทางไปร้านค้า"}
                        {order.status === 'PICKED_UP' && "ไรเดอร์รับสินค้าแล้ว กำลังเดินทางมาหาคุณ"}
                        {order.status === 'RIDER_ARRIVED' && "ไรเดอร์ถึงจุดส่งแล้ว กรุณาเตรียมรับสินค้า"}
                        {order.status === 'DELIVERED_WAITING_PAYMENT' && "ส่งสินค้าแล้ว กรุณาชำระเงิน/ยืนยัน"}
                        {order.status === 'COMPLETED' && "คำสั่งซื้อเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ"}
                        {order.status === 'CANCELLED' && "คำสั่งซื้อถูกยกเลิก"}
                    </Text>
                </View>

                {/* Rider Live Location Placeholder */}
                {['RIDER_HEADING_TO_STORE', 'PICKED_UP', 'RIDER_ARRIVED'].includes(order.status) && order.riderLiveLocation && (
                    <View style={styles.mapContainer}>
                        <Text style={styles.mapText}>[ Live Map Placeholder ]</Text>
                        <Text style={styles.mapSubText}>
                            Rider is at: {order.riderLiveLocation.lat.toFixed(4)}, {order.riderLiveLocation.lng.toFixed(4)}
                        </Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>รายการสินค้า</Text>
                    {order.items.map((item: any, index: number) => (
                        <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.productName} x {item.quantity}</Text>
                            <Text style={styles.itemPrice}>{item.price * item.quantity} บาท</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>ยอดรวมทั้งสิ้น</Text>
                        <Text style={styles.totalPrice}>{order.grandTotal} บาท</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ข้อมูลการจัดส่ง</Text>
                    <Text style={styles.text}>ชื่อ: {order.customerName}</Text>
                    <Text style={styles.text}>ที่อยู่: {order.customerAddress}</Text>
                    <Text style={styles.text}>เบอร์โทร: {order.customerPhone || '-'}</Text>
                    {order.riderName && (
                        <Text style={styles.riderText}>ไรเดอร์: {order.riderName}</Text>
                    )}
                </View>

                {/* Rate Rider Button */}
                {order.status === 'COMPLETED' && !order.riderRating && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.rateButton} onPress={() => setShowRatingModal(true)}>
                            <Text style={styles.rateButtonText}>ให้คะแนนไรเดอร์</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Display Rider Review if exists */}
                {order.riderRating && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>รีวิวไรเดอร์ของคุณ</Text>
                        <View style={styles.starRow}>
                            {[...Array(order.riderRating)].map((_, i) => (
                                <Ionicons key={i} name="star" size={20} color="#FBC02D" />
                            ))}
                        </View>
                        <Text style={styles.text}>"{order.riderReviewText}"</Text>
                    </View>
                )}
            </View>
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleString('th-TH')}</Text>

            {/* Rating Modal */}
            <Modal
                visible={showRatingModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowRatingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>ให้คะแนนไรเดอร์</Text>
                        <View style={styles.starRowLarge}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons
                                        name={star <= rating ? "star" : "star-outline"}
                                        size={40}
                                        color="#FBC02D"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="เขียนรีวิวการบริการ..."
                            placeholderTextColor="#6A7A7A"
                            multiline
                            value={comment}
                            onChangeText={setComment}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowRatingModal(false)}>
                                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
                                <Text style={styles.submitText}>ส่งรีวิว</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
        padding: 16,
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
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
        paddingBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    trackLink: {
        fontSize: 12,
        color: '#36D873',
        marginTop: 4,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#001010',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusSection: {
        marginBottom: 20,
        backgroundColor: '#0F1A1A',
        padding: 12,
        borderRadius: 8,
    },
    statusTitle: {
        fontSize: 14,
        color: '#8FA3A3',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusDesc: {
        fontSize: 14,
        color: '#B0B0B0',
    },
    mapContainer: {
        height: 120,
        backgroundColor: '#0F1A1A',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    mapText: {
        color: '#6A7A7A',
        fontWeight: 'bold',
    },
    mapSubText: {
        color: '#36D873',
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        color: '#B0B0B0',
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#1E3C33',
        marginVertical: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#36D873',
    },
    text: {
        fontSize: 14,
        color: '#B0B0B0',
        marginBottom: 4,
    },
    riderText: {
        fontSize: 14,
        color: '#36D873',
        fontWeight: 'bold',
        marginTop: 4,
    },
    errorText: {
        fontSize: 18,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 50,
    },
    date: {
        fontSize: 12,
        color: '#6A7A7A',
        textAlign: 'center',
        marginBottom: 20,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: "#1E3C33",
        paddingTop: 16,
        marginTop: 8,
    },
    rateButton: {
        backgroundColor: "#FBC02D",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    rateButtonText: {
        color: "#001010",
        fontWeight: "bold",
        fontSize: 16,
    },
    starRow: {
        flexDirection: "row",
        gap: 4,
        marginBottom: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#02090A',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1E3C33',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    starRowLarge: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#0F1A1A',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#263B3B',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    submitButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#36D873',
        alignItems: 'center',
    },
    submitText: {
        color: '#001010',
        fontWeight: 'bold',
    },
});
