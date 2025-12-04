import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useOrders } from '../../store/orders';
import { useAuth } from '../../store/auth';

export default function RiderReviewsScreen() {
    const { orders } = useOrders();
    const { user } = useAuth();

    const reviews = useMemo(() => {
        if (!user) return [];
        return orders
            .filter(
                (o) =>
                    o.riderId === user.id &&
                    o.buyerReview &&
                    o.buyerReview.rating > 0
            )
            .map((o) => ({
                id: o.id,
                rating: o.buyerReview!.rating,
                comment: o.buyerReview!.comment,
                date: o.buyerReview!.createdAt,
                buyerName: o.buyerName ?? "ลูกค้า NadHub",
            }));
    }, [orders, user]);

    const formatDate = (date: string | number | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('th-TH');
    };

    return (
        <View style={styles.container}>
            {reviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.empty}>ยังไม่มีรีวิวจากลูกค้า</Text>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.buyerName}>{item.buyerName}</Text>
                                <Text style={styles.date}>{formatDate(item.date)}</Text>
                            </View>
                            <Text style={styles.rating}>⭐ {item.rating}</Text>
                            {!!item.comment && <Text style={styles.comment}>{item.comment}</Text>}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
    },
    list: {
        padding: 16,
        gap: 12,
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
        marginBottom: 8,
    },
    buyerName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#FFFFFF',
    },
    rating: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#6A7A7A',
    },
    comment: {
        fontSize: 14,
        color: '#E0E0E0',
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    empty: {
        fontSize: 16,
        color: '#6A7A7A',
    },
});
