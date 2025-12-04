import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RiderStackParamList } from '../../types';
import { useOrders, Order } from '../../store/orders';
import { useProducts } from '../../store/products';
import { getOrderStatusLabel, getOrderStatusColor, isActiveStatus, OrderStatus } from '../../utils/orderStatus';

const CURRENT_RIDER = "Demo Rider";

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RiderHistory'>;

export default function RiderHistoryScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { getOrdersByRider } = useOrders();
    const { products } = useProducts();
    const [showActive, setShowActive] = useState<'active' | 'history'>('active');

    const myOrders = getOrdersByRider(CURRENT_RIDER);

    const filteredOrders = useMemo(() => {
        return myOrders.filter(order => {
            if (showActive === 'active') {
                return isActiveStatus(order.status);
            } else {
                return !isActiveStatus(order.status);
            }
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [myOrders, showActive]);

    const getProductName = (productId: string) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'สินค้าไม่ทราบชื่อ';
    };

    const renderItem = ({ item }: { item: Order }) => {
        const statusLabel = getOrderStatusLabel(item.status);
        const statusColor = getOrderStatusColor(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('RiderOrderDetail', { orderId: item.id })}
            >
                <View style={styles.header}>
                    <Text style={styles.orderId}>Order #{item.id.slice(-4)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
                </View>

                <Text style={styles.productName}>{getProductName(item.productId)}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>ยอดเงิน:</Text>
                    <Text style={styles.price}>{item.deliveryFee} บาท</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>ลูกค้า:</Text>
                    <Text style={styles.value}>{item.customerName}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>ที่อยู่:</Text>
                    <Text style={styles.value} numberOfLines={1}>{item.customerAddress}</Text>
                </View>

                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('th-TH')}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterRow}>
                <Pressable
                    style={[
                        styles.filterButton,
                        showActive === 'active' && styles.filterButtonActive,
                    ]}
                    onPress={() => setShowActive('active')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            showActive === 'active' && styles.filterTextActive,
                        ]}
                    >
                        งานปัจจุบัน
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.filterButton,
                        showActive === 'history' && styles.filterButtonActive,
                    ]}
                    onPress={() => setShowActive('history')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            showActive === 'history' && styles.filterTextActive,
                        ]}
                    >
                        ประวัติงาน
                    </Text>
                </Pressable>
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {showActive === 'active' ? 'ไม่มีงานที่กำลังดำเนินการ' : 'ไม่มีประวัติงาน'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608', // Dark theme background
    },
    filterRow: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#02090A',
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#263B3B',
        alignItems: 'center',
        backgroundColor: '#0F1A1A',
    },
    filterButtonActive: {
        backgroundColor: '#36D873',
        borderColor: '#36D873',
    },
    filterText: {
        fontSize: 14,
        color: '#8FA3A3',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#001010',
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#02090A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1E3C33',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontWeight: 'bold',
        color: '#8FA3A3',
        fontSize: 14,
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
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: '#8FA3A3',
        width: 60,
    },
    value: {
        fontSize: 14,
        color: '#FFFFFF',
        flex: 1,
    },
    price: {
        fontSize: 14,
        color: '#36D873',
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        textAlign: 'right',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#8FA3A3',
    },
});
