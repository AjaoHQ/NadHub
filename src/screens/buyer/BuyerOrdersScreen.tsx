import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BuyerStackParamList } from '../../types';
import { useOrders, Order } from '../../store/orders';
import { useProducts } from '../../store/products';
import { useAuth } from '../../store/auth';
import { getOrderStatusLabel, getOrderStatusColor, isActiveStatus } from '../../utils/orderStatus';

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList, 'BuyerOrders'>;

export default function BuyerOrdersScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { orders } = useOrders();
    const { products } = useProducts();
    const { user } = useAuth();
    const [showActive, setShowActive] = useState<'active' | 'history'>('active');

    const myOrders = orders.filter(o => o.buyerId === user?.id);

    const filteredOrders = useMemo(() => {
        return myOrders.filter(order => {
            if (showActive === 'active') {
                return isActiveStatus(order.status);
            } else {
                return !isActiveStatus(order.status);
            }
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [myOrders, showActive]);

    const renderItem = ({ item }: { item: Order }) => {
        const statusLabel = getOrderStatusLabel(item.status);
        const statusColor = getOrderStatusColor(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('BuyerOrderDetail', { orderId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.shopName}>ร้านค้า NadHub</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    {item.items.map((orderItem, index) => (
                        <View key={index} style={styles.productRow}>
                            <Text style={styles.productName} numberOfLines={1}>
                                {orderItem.productName}
                            </Text>
                            <Text style={styles.quantity}>x{orderItem.quantity}</Text>
                        </View>
                    ))}
                    <Text style={styles.totalPrice}>฿{item.grandTotal}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.timestamp}>
                        {new Date(item.createdAt).toLocaleString('th-TH', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                    {item.ratingStars ? (
                        <View style={styles.ratingContainer}>
                            <Text style={styles.ratingText}>⭐ {item.ratingStars}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabelText, { color: statusColor }]}>
                        สถานะ: {statusLabel}
                    </Text>
                </View>

                {/* Review Button */}
                {item.status === 'delivered' || item.status === 'COMPLETED' ? (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => navigation.navigate('Review', { orderId: item.id } as any)}
                    >
                        <Text style={styles.reviewText}>ให้คะแนนร้านค้า</Text>
                    </TouchableOpacity>
                ) : null}
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
                        กำลังดำเนินการ
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
                        ประวัติคำสั่งซื้อ
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
                            {showActive === 'active' ? 'ไม่มีคำสั่งซื้อที่กำลังดำเนินการ' : 'ไม่มีประวัติคำสั่งซื้อ'}
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
        backgroundColor: '#000608',
    },
    filterRow: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#000A0A',
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1E3C33',
        alignItems: 'center',
        backgroundColor: '#02090A',
    },
    filterButtonActive: {
        backgroundColor: '#36D873',
        borderColor: '#36D873',
    },
    filterText: {
        fontSize: 14,
        color: '#6A7A7A',
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
        paddingBottom: 8,
    },
    shopName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#FFFFFF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#001010',
        fontWeight: 'bold',
    },
    cardBody: {
        marginBottom: 12,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        color: '#FFFFFF',
        flex: 1,
        marginRight: 8,
    },
    quantity: {
        fontSize: 14,
        color: '#6A7A7A',
        marginLeft: 8,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#36D873',
        textAlign: 'right',
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E3C33',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FBC02D',
    },
    timestamp: {
        fontSize: 12,
        color: '#6A7A7A',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#6A7A7A',
    },
    statusRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#1E3C33',
    },
    statusLabelText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    reviewButton: {
        marginTop: 12,
        backgroundColor: '#FBC02D',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    reviewText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
