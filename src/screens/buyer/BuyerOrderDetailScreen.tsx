import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { BuyerStackParamList } from '../../types';
import { useOrders } from '../../store/orders';
import { Ionicons } from '@expo/vector-icons';
import { getOrderStatusLabel, getOrderStatusColor } from '../../utils/orderStatus';
import { MapPicker } from '../../components/MapPicker';
import { PinMarker } from '../../components/PinMarker';
import { PinLocation } from '../../types/pins';

type ScreenRouteProp = RouteProp<BuyerStackParamList, 'BuyerOrderDetail'>;

export default function BuyerOrderDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { orderId } = route.params;
    const { getOrderById, rateRider, updateDropoffPin, startLiveTracking } = useOrders();
    const order = getOrderById(orderId);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Real-time listener
    useEffect(() => {
        if (!orderId) return;
        const unsubscribe = startLiveTracking(orderId);
        return () => unsubscribe();
    }, [orderId]);

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

    const handleSavePin = async (location: PinLocation) => {
        const lat = location.latitude ?? location.lat ?? 0;
        const lng = location.longitude ?? location.lng ?? 0;
        await updateDropoffPin(orderId, lat, lng, location.note);
        setShowMapPicker(false);
    };

    const statusLabel = getOrderStatusLabel(order.status);
    const statusColor = getOrderStatusColor(order.status);

    // Map Logic
    // Map Logic
    const pickupLoc = {
        latitude: order.pickupPin?.latitude ?? order.pickupPin?.lat ?? order.storeLocation?.lat ?? 13.7563,
        longitude: order.pickupPin?.longitude ?? order.pickupPin?.lng ?? order.storeLocation?.lng ?? 100.5018,
        lat: order.pickupPin?.lat ?? 13.7563,
        lng: order.pickupPin?.lng ?? 100.5018
    };

    // Ensure we handle potentially missing customerLocation by providing defaults if both are missing
    const dropoffLoc = order.dropoffPin ? {
        latitude: order.dropoffPin.latitude ?? order.dropoffPin.lat ?? 13.7563,
        longitude: order.dropoffPin.longitude ?? order.dropoffPin.lng ?? 100.5018,
        lat: order.dropoffPin.lat ?? 13.7563,
        lng: order.dropoffPin.lng ?? 100.5018,
        note: order.dropoffPin.note
    } : (order.customerLocation ? {
        latitude: order.customerLocation.lat,
        longitude: order.customerLocation.lng,
        lat: order.customerLocation.lat,
        lng: order.customerLocation.lng
    } : {
        latitude: 13.7563,
        longitude: 100.5018,
        lat: 13.7563,
        lng: 100.5018
    });
    const riderLoc = order.riderLiveLocation || order.riderLocation;
    const ridersLocObj = riderLoc ? {
        latitude: riderLoc.lat,
        longitude: riderLoc.lng
    } : null;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('OrderTracking' as any, { orderId: order.id } as any)}>
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

                    {/* MAP SECTION */}
                    <View style={styles.mapPreviewContainer}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.mapPreview}
                            initialRegion={{
                                latitude: dropoffLoc.latitude,
                                longitude: dropoffLoc.longitude,
                                latitudeDelta: 0.02,
                                longitudeDelta: 0.02,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <PinMarker
                                coordinate={{ latitude: pickupLoc.latitude, longitude: pickupLoc.longitude }}
                                type="pickup"
                                title="จุดรับสินค้า (ร้าน)"
                            />
                            <PinMarker
                                coordinate={{ latitude: dropoffLoc.latitude, longitude: dropoffLoc.longitude }}
                                type="dropoff"
                                title="จุดส่งสินค้า (คุณ)"
                            />
                            {ridersLocObj && (
                                <PinMarker
                                    coordinate={{ latitude: ridersLocObj.latitude, longitude: ridersLocObj.longitude }}
                                    type="rider"
                                    title={order.riderName || "Rider"}
                                />
                            )}
                        </MapView>

                        {/* Edit Button overlay - Only allow edit if not yet delivered */}
                        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && order.status !== 'DELIVERED_WAITING_PAYMENT' && (
                            <TouchableOpacity
                                style={styles.editMapBtn}
                                onPress={() => setShowMapPicker(true)}
                            >
                                <Ionicons name="create-outline" size={20} color="#fff" />
                                <Text style={styles.editMapText}>แก้ไขจุดส่ง</Text>
                            </TouchableOpacity>
                        )}

                        {order.dropoffPin?.note && (
                            <View style={styles.pinNote}>
                                <Text style={styles.pinNoteText}>📌 {order.dropoffPin.note}</Text>
                            </View>
                        )}
                    </View>

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

                {/* Map Picker Modal */}
                <Modal visible={showMapPicker} animationType="slide">
                    <MapPicker
                        label="ระบุจุดส่งสินค้า (บ้าน/ออฟฟิศ)"
                        placeholderNote="ระบุจุดสังเกตเพิ่มเติม"
                        initialPin={dropoffLoc}
                        onConfirm={handleSavePin}
                        onCancel={() => setShowMapPicker(false)}
                    />
                </Modal>
            </ScrollView>
        </View>
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
    // New Styles for Map
    mapPreviewContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#1E3C33'
    },
    mapPreview: {
        width: '100%',
        height: '100%'
    },
    editMapBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    editMapText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 12,
        fontWeight: 'bold'
    },
    pinNote: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 6,
        borderRadius: 8,
    },
    pinNoteText: {
        fontSize: 12,
        color: '#333'
    }
});
