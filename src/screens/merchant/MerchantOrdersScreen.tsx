import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MerchantOrderStackParamList } from '../../types';
import { useOrders, Order } from '../../store/orders';
import { useAuth, MerchantProfile } from '../../store/auth';
import { getOrderStatusLabel, getOrderStatusColor } from '../../utils/orderStatus';

type NavigationProp = NativeStackNavigationProp<MerchantOrderStackParamList, 'MerchantOrders'>;

export default function MerchantOrdersScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { orders, confirmOrder } = useOrders();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'new' | 'ongoing' | 'history'>('new');

    const merchant = user as MerchantProfile;
    // Removed isApproved check - all merchants can see orders

    // Filter for this merchant (Mock store1)
    const myOrders = orders.filter(o => o.storeId === 'store1');

    const displayedOrders = myOrders.filter(order => {
        if (activeTab === 'new') {
            return order.status === 'pending' || order.status === 'PENDING_STORE_CONFIRM';
        } else if (activeTab === 'ongoing') {
            return [
                'confirmed', 'assigned', 'picked_up', 'delivered',
                'STORE_CONFIRMED',
                'WAITING_RIDER',
                'RIDER_HEADING_TO_STORE',
                'PICKED_UP',
                'RIDER_ARRIVED',
                'DELIVERED_WAITING_PAYMENT'
            ].includes(order.status);
        } else {
            return ['COMPLETED', 'CANCELLED'].includes(order.status);
        }
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleConfirm = (orderId: string) => {
        confirmOrder(orderId);
    };

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MerchantOrderDetail', { orderId: item.id })}
        >
            <View style={styles.header}>
                <Text style={styles.orderId}>Order #{item.id.slice(-4)}</Text>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleString('th-TH')}
                </Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>รายการสินค้า:</Text>
                {item.items.map((prod, index) => (
                    <Text key={index} style={styles.productName}>
                        - {prod.productName} x {prod.quantity}
                    </Text>
                ))}
            </View>

            <View style={styles.totalSection}>
                <Text style={styles.totalText}>ยอดรวม: {item.grandTotal || item.total} บาท</Text>
            </View>

            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getOrderStatusLabel(item.status)}</Text>
                </View>
            </View>

            {/* Confirm Button for Pending Orders */}
            {(item.status === 'pending' || item.status === 'PENDING_STORE_CONFIRM') && (
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleConfirm(item.id)}
                >
                    <Text style={styles.confirmButtonText}>ยืนยันคำสั่งซื้อ</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <Pressable
                    style={[styles.tab, activeTab === 'new' && styles.activeTab]}
                    onPress={() => setActiveTab('new')}
                >
                    <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>
                        ใหม่ ({myOrders.filter(o => o.status === 'pending' || o.status === 'PENDING_STORE_CONFIRM').length})
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, activeTab === 'ongoing' && styles.activeTab]}
                    onPress={() => setActiveTab('ongoing')}
                >
                    <Text style={[styles.tabText, activeTab === 'ongoing' && styles.activeTabText]}>กำลังทำ</Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>ประวัติ</Text>
                </Pressable>
            </View>

            <FlatList
                data={displayedOrders}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีรายการคำสั่งซื้อ</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#E8F5E9',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#34C759',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderId: {
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    infoSection: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    totalSection: {
        marginBottom: 12,
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34C759',
    },
    statusContainer: {
        alignItems: 'flex-start',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#34C759',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    subText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
});
