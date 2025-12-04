import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MerchantOrderStackParamList } from '../../types';
import { useOrders } from '../../store/orders';
import { getOrderStatusLabel, getOrderStatusColor } from '../../utils/orderStatus';

type ScreenRouteProp = RouteProp<MerchantOrderStackParamList, 'MerchantOrderDetail'>;

export default function MerchantOrderDetailScreen() {
    const route = useRoute<ScreenRouteProp>();
    const navigation = useNavigation();
    const { orderId } = route.params;
    const { getOrderById, confirmOrder, setWaitingRider, cancelOrder } = useOrders();
    const order = getOrderById(orderId);

    if (!order) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>ไม่พบคำสั่งซื้อ</Text>
            </View>
        );
    }

    const handleConfirm = () => {
        Alert.alert(
            "ยืนยันรับออเดอร์",
            "ต้องการรับออเดอร์นี้และเริ่มค้นหาไรเดอร์หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยัน",
                    onPress: () => {
                        confirmOrder(order.id);
                        // In a real app, this might be a separate step or automatic
                        // Here we set it to waiting rider immediately after confirm
                        setTimeout(() => {
                            setWaitingRider(order.id);
                        }, 500);
                        Alert.alert("สำเร็จ", "รับออเดอร์แล้ว ระบบกำลังค้นหาไรเดอร์");
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const handleReject = () => {
        Alert.alert(
            "ปฏิเสธรับออเดอร์",
            "ต้องการปฏิเสธและยกเลิกออเดอร์นี้หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยัน",
                    onPress: () => {
                        cancelOrder(order.id);
                        Alert.alert("สำเร็จ", "ปฏิเสธและยกเลิกออเดอร์แล้ว");
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const statusLabel = getOrderStatusLabel(order.status);
    const statusColor = getOrderStatusColor(order.status);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
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
                    <Text style={styles.sectionTitle}>ข้อมูลลูกค้า</Text>
                    <Text style={styles.text}>ชื่อ: {order.customerName}</Text>
                    <Text style={styles.text}>ที่อยู่: {order.customerAddress}</Text>
                    <Text style={styles.text}>เบอร์โทร: {order.customerPhone || '-'}</Text>
                    {order.buyerNote ? (
                        <View style={styles.noteBox}>
                            <Text style={styles.noteTitle}>หมายเหตุ:</Text>
                            <Text style={styles.noteText}>{order.buyerNote}</Text>
                        </View>
                    ) : null}
                </View>

                {order.riderName && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ข้อมูลไรเดอร์</Text>
                        <Text style={styles.text}>ชื่อ: {order.riderName}</Text>
                        <Text style={styles.text}>เบอร์โทร: {order.riderPhone || '-'}</Text>
                    </View>
                )}

                {/* Actions */}
                {order.status === 'PENDING_STORE_CONFIRM' && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleConfirm}>
                            <Text style={styles.buttonText}>ยืนยันรับออเดอร์</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={handleReject}>
                            <Text style={styles.buttonText}>ปฏิเสธ</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleString('th-TH')}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
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
        color: '#333',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34C759',
    },
    text: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    noteBox: {
        backgroundColor: '#FFF8E1',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    noteTitle: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#F57C00',
    },
    noteText: {
        fontSize: 14,
        color: '#333',
    },
    errorText: {
        fontSize: 18,
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 50,
    },
    date: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#34C759',
    },
    rejectButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
