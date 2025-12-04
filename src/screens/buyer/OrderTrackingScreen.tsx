import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BuyerStackParamList } from '../../types';
import { useOrders, Order } from '../../store/orders';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus } from '../../utils/orderStatus';

type OrderTrackingRouteProp = RouteProp<BuyerStackParamList, 'OrderTracking'>;

export default function OrderTrackingScreen() {
    const route = useRoute<OrderTrackingRouteProp>();
    const { orderId } = route.params;
    const { getOrderById } = useOrders();
    const [order, setOrder] = useState<Order | undefined>(undefined);

    // Poll for updates (since we don't have real subscriptions in this mock)
    useEffect(() => {
        const fetchOrder = () => {
            const foundOrder = getOrderById(orderId);
            setOrder(foundOrder);
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [orderId, getOrderById]);

    if (!order) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#36D873" />
                <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
            </View>
        );
    }

    // Define steps for the timeline
    const allSteps: { status: OrderStatus[], label: string, icon: string }[] = [
        { status: ['PENDING_STORE_CONFIRM'], label: 'รอร้านค้ายืนยัน', icon: 'time-outline' },
        { status: ['STORE_CONFIRMED', 'WAITING_RIDER'], label: 'กำลังหาไรเดอร์', icon: 'search-outline' },
        { status: ['RIDER_HEADING_TO_STORE', 'RIDER_ARRIVED'], label: 'ไรเดอร์ไปรับอาหาร', icon: 'bicycle-outline' },
        { status: ['PICKED_UP', 'DELIVERED_WAITING_PAYMENT'], label: 'กำลังจัดส่ง', icon: 'navigate-outline' },
        { status: ['COMPLETED'], label: 'จัดส่งสำเร็จ', icon: 'checkmark-circle-outline' },
    ];

    // Determine current step index
    let currentStepIndex = 0;
    if (order.status === 'CANCELLED') {
        currentStepIndex = -1; // Special case
    } else {
        currentStepIndex = allSteps.findIndex(step => step.status.includes(order.status));
        // If exact status not found (maybe future status), try to approximate or keep last known
        if (currentStepIndex === -1) {
            // Fallback logic if needed, or just show completed if it's past
            if (order.status === 'COMPLETED') currentStepIndex = allSteps.length - 1;
        }
    }

    const showMap = ['RIDER_HEADING_TO_STORE', 'PICKED_UP', 'DELIVERED_WAITING_PAYMENT', 'RIDER_ARRIVED'].includes(order.status);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.orderId}>Order #{order.id.slice(-4)}</Text>
                <Text style={styles.statusText}>
                    สถานะ: {order.status === 'CANCELLED' ? 'ยกเลิกแล้ว' : (allSteps[currentStepIndex]?.label || order.status)}
                </Text>
            </View>

            {/* Map Simulation */}
            {showMap && (
                <View style={styles.mapContainer}>
                    <Text style={styles.mapTitle}>📍 ติดตามไรเดอร์</Text>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map" size={48} color="#263B3B" />
                        <Text style={styles.mapText}>[ แผนที่จำลอง ]</Text>
                        {order.riderLocation && (
                            <Text style={styles.coordText}>
                                Lat: {order.riderLocation.lat.toFixed(4)}, Lng: {order.riderLocation.lng.toFixed(4)}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.timeline}>
                {allSteps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                        <View key={index} style={styles.stepContainer}>
                            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                                <Ionicons name={step.icon as any} size={20} color={isActive ? '#000A0A' : '#6A7A7A'} />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepLabel, isActive && styles.activeStepLabel]}>{step.label}</Text>
                                {isCurrent && <Text style={styles.currentStepText}>กำลังดำเนินการ</Text>}
                            </View>
                            {index < allSteps.length - 1 && (
                                <View style={[styles.line, index < currentStepIndex && styles.activeLine]} />
                            )}
                        </View>
                    );
                })}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>ข้อมูลการจัดส่ง</Text>
                <Text style={styles.infoText}>📍 ร้านค้า: {order.storeName}</Text>
                <Text style={styles.infoText}>🏠 ที่อยู่จัดส่ง: {order.customerAddress}</Text>
                {order.riderName && <Text style={styles.infoText}>🛵 ไรเดอร์: {order.riderName}</Text>}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000608',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 10,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    orderId: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#36D873',
    },
    statusText: {
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 4,
    },
    mapContainer: {
        marginBottom: 24,
        backgroundColor: '#02090A',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#1E3C33',
    },
    mapTitle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    mapPlaceholder: {
        height: 150,
        backgroundColor: '#0F1A1A',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#263B3B',
    },
    mapText: {
        color: '#6A7A7A',
        marginTop: 8,
        fontWeight: 'bold',
    },
    coordText: {
        color: '#36D873',
        fontSize: 12,
        marginTop: 4,
    },
    timeline: {
        marginBottom: 24,
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        position: 'relative',
        height: 50, // Fixed height for alignment
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#02090A',
        borderWidth: 1,
        borderColor: '#1E3C33',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    activeIconContainer: {
        backgroundColor: '#36D873',
        borderColor: '#36D873',
    },
    stepContent: {
        marginLeft: 16,
        justifyContent: 'center',
    },
    stepLabel: {
        fontSize: 15,
        color: '#6A7A7A',
    },
    activeStepLabel: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    currentStepText: {
        fontSize: 12,
        color: '#36D873',
    },
    line: {
        position: 'absolute',
        left: 17, // Center of 36px icon
        top: 36,
        bottom: -14,
        width: 2,
        backgroundColor: '#1E3C33',
        zIndex: 0,
    },
    activeLine: {
        backgroundColor: '#36D873',
    },
    infoCard: {
        backgroundColor: '#02090A',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1E3C33',
        marginBottom: 40,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#B0B0B0',
        marginBottom: 8,
    },
});
