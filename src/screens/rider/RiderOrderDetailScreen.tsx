import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { useOrders, OrderStatus } from '../../store/orders';
import { useAuth } from '../../store/auth';
import { useProducts } from '../../store/products';
import { PinMarker } from '../../components/PinMarker';
import { getOrderStatusLabel, getOrderStatusColor } from "../../utils/orderStatus";
import { openNavigationApp } from '../../services/pins';

type RiderOrderDetailRouteProp = RouteProp<{ RiderOrderDetail: { orderId: string } }, 'RiderOrderDetail'>;

const CURRENT_RIDER = "Rider Demo"; // Mock

export default function RiderOrderDetailScreen() {
    const route = useRoute<RiderOrderDetailRouteProp>();
    const { orderId } = route.params;
    const navigation = useNavigation<any>();
    const {
        orders,
        updateOrderStatus,
        assignRider,
        confirmPickup,
        confirmDelivery,
        completeOrder,
        updateRiderLocation
    } = useOrders();
    const { products } = useProducts();

    const order = orders.find(o => o.id === orderId);
    const product = order ? products.find(p => p.id === order.productId) : null;

    // Logic: Location tracking
    const mapRef = useRef<MapView>(null);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const subscriberRef = useRef<Location.LocationSubscription | null>(null);

    // Filter statuses that require tracking
    const isLive = order && isMyJob(order) && ['assigned', 'picked_up', 'delivered', 'RIDER_HEADING_TO_STORE', 'PICKED_UP', 'DELIVERED_WAITING_PAYMENT', 'RIDER_ARRIVED'].includes(order.status);

    function isMyJob(o: any) {
        return o.riderName === CURRENT_RIDER;
    }

    // Start/Stop Location Tracking
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission to access location was denied");
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // 5 seconds
                    distanceInterval: 10, // 10 meters
                },
                (location) => {
                    setCurrentLocation(location);

                    // Upload to Firebase if active job
                    if (isLive && order) {
                        updateRiderLocation(order.id, {
                            lat: location.coords.latitude,
                            lng: location.coords.longitude,
                            updatedAt: Date.now()
                        });
                    }
                }
            );
            subscriberRef.current = subscription;
        };

        if (isLive) {
            startTracking();
        }

        return () => {
            if (subscriberRef.current) {
                subscriberRef.current.remove();
            }
        };
    }, [isLive, order?.id]);

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

    const statusLabel = getOrderStatusLabel(order.status as OrderStatus);
    const statusColor = getOrderStatusColor(order.status as OrderStatus);
    const isJobMine = isMyJob(order);

    // Safe fallbacks for locations with new Types
    // Ensure we handle both legacy lat/lng and new latitude/longitude if mixed data
    const getLat = (loc: any) => loc?.latitude ?? loc?.lat ?? 13.7563;
    const getLng = (loc: any) => loc?.longitude ?? loc?.lng ?? 100.5018;

    const pickupLoc = {
        latitude: getLat(order.pickupPin || order.storeLocation),
        longitude: getLng(order.pickupPin || order.storeLocation),
        lat: getLat(order.pickupPin || order.storeLocation),
        lng: getLng(order.pickupPin || order.storeLocation)
    };
    const dropoffLoc = {
        latitude: getLat(order.dropoffPin || order.customerLocation),
        longitude: getLng(order.dropoffPin || order.customerLocation),
        lat: getLat(order.dropoffPin || order.customerLocation),
        lng: getLng(order.dropoffPin || order.customerLocation)
    };

    // Rider locaion
    const rawRiderLoc = currentLocation ? currentLocation.coords : (order.riderLiveLocation || order.riderLocation);
    const riderLoc = rawRiderLoc ? {
        latitude: getLat(rawRiderLoc),
        longitude: getLng(rawRiderLoc),
        lat: getLat(rawRiderLoc),
        lng: getLng(rawRiderLoc)
    } : null;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.sectionTitle}>รายละเอียดงาน</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>{statusLabel}</Text>
                        </View>
                    </View>

                    {/* Map Section */}
                    {isJobMine && ['assigned', 'picked_up', 'delivered', 'RIDER_HEADING_TO_STORE', 'PICKED_UP', 'DELIVERED_WAITING_PAYMENT', 'RIDER_ARRIVED'].includes(order.status) && (
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={mapRef}
                                provider={PROVIDER_GOOGLE}
                                style={styles.map}
                                initialRegion={{
                                    latitude: riderLoc?.latitude || pickupLoc.latitude, // Prioritize rider loc
                                    longitude: riderLoc?.longitude || pickupLoc.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }}
                                showsUserLocation={true}
                            >
                                <PinMarker coordinate={pickupLoc} type="pickup" title="ร้านค้า" />
                                <PinMarker coordinate={dropoffLoc} type="dropoff" title="ลูกค้า" />

                                {/* Draw line if we have rider loc */}
                                {riderLoc && (
                                    <Polyline
                                        coordinates={[
                                            riderLoc,
                                            pickupLoc,
                                            dropoffLoc
                                        ]}
                                        strokeColor="#36D873"
                                        strokeWidth={3}
                                    />
                                )}
                            </MapView>

                            <View style={styles.navConfigContainer}>
                                <TouchableOpacity
                                    style={[styles.navButton, { marginBottom: 8 }]}
                                    onPress={() => openNavigationApp(pickupLoc.latitude, pickupLoc.longitude, "ร้านค้า")}
                                >
                                    <Ionicons name="storefront" size={20} color="#36D873" />
                                    <Text style={styles.navButtonText}>นำทางไปร้าน</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => openNavigationApp(dropoffLoc.latitude, dropoffLoc.longitude, "ลูกค้า")}
                                >
                                    <Ionicons name="person" size={20} color="#36D873" />
                                    <Text style={styles.navButtonText}>นำทางไปส่ง</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}


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
                        <Text style={styles.label}>จุดรับสินค้า (Pickup)</Text>
                        {/* Use Pin Address if available, fallback to storeAddress */}
                        <Text style={styles.value}>{order.pickupPin?.addressText || order.storeAddress || 'ร้านค้า NadHub'}</Text>
                        {order.pickupPin?.note && <Text style={styles.pinNote}>📍 {order.pickupPin.note}</Text>}
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>จุดส่งสินค้า (Dropoff)</Text>
                        {/* Use Pin Address if available, fallback to customerAddress */}
                        <Text style={styles.value}>{order.dropoffPin?.addressText || order.customerAddress}</Text>
                        {order.dropoffPin?.note && <Text style={styles.pinNote}>📍 {order.dropoffPin.note}</Text>}
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

                    {isJobMine && (order.status === 'assigned' || order.status === 'RIDER_HEADING_TO_STORE') && (
                        <TouchableOpacity style={styles.actionButton} onPress={handlePickup}>
                            <Text style={styles.actionButtonText}>ยืนยันรับของแล้ว</Text>
                        </TouchableOpacity>
                    )}

                    {isJobMine && (order.status === 'picked_up' || order.status === 'PICKED_UP' || order.status === 'RIDER_ARRIVED') && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleDelivered}>
                            <Text style={styles.actionButtonText}>ยืนยันส่งของแล้ว</Text>
                        </TouchableOpacity>
                    )}

                    {isJobMine && (order.status === 'delivered' || order.status === 'DELIVERED_WAITING_PAYMENT') && (
                        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteJob}>
                            <Text style={styles.completeButtonText}>ปิดงาน</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={{ color: "#999", fontSize: 10, marginTop: 20 }}>
                        RAW: {JSON.stringify(order, null, 2)}
                    </Text>
                </View>
            </ScrollView>
        </View>
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
    pinNote: {
        fontSize: 12,
        color: '#36D873',
        marginTop: 2,
        marginLeft: 4,
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
    // Map Styles
    mapContainer: {
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#36D873',
    },
    map: {
        flex: 1,
    },
    navConfigContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        flexDirection: 'column',
    },
    navButton: {
        backgroundColor: '#02090A',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#36D873',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 3,
    },
    navButtonText: {
        color: '#36D873',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    // Action Buttons
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
        fontWeight: 'bold',
        fontSize: 18,
    },
    actionButton: {
        backgroundColor: '#36D873',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#001010',
        fontWeight: 'bold',
        fontSize: 18,
    },
    completeButton: {
        backgroundColor: '#FFD700',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#001010',
        fontWeight: 'bold',
        fontSize: 18,
    },
    // Review Styles
    reviewContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#0F1A1A',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    stars: {
        flexDirection: 'row',
        gap: 4,
    },
    ratingValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    commentBox: {
        backgroundColor: '#02090A',
        padding: 12,
        borderRadius: 8,
    },
    commentText: {
        color: '#8FA3A3',
        fontStyle: 'italic',
    },
});
